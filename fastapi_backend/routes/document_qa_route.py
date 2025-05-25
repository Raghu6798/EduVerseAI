# ==================== Standard Library ====================
import os
import tempfile
from uuid import uuid4
from pathlib import Path
from typing import List,Optional
from datetime import datetime
from pydantic import BaseModel
from tenacity import retry,stop_after_attempt, wait_exponential

# ==================== FastAPI ====================
import FastAPI as _  # Prevent shadowing the module name
from fastapi import APIRouter, File, UploadFile, HTTPException, Form,Request,Depends
from fastapi.security import HTTPBearer
from fastapi.responses import JSONResponse

# ==================== Logging ====================
from loguru import logger

# ==================== Load environment ====================
from dotenv import load_dotenv
load_dotenv()
logger.info("Loaded environment variables from .env")

# ==================== Supabase ====================
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_PRIVATE")

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def get_supabase_client() -> Client:
    """Initializes and returns a Supabase client with retry."""
    return create_client(SUPABASE_URL, SUPABASE_KEY)

supabase: Client = get_supabase_client()
logger.info("Initialized Supabase client")

# ==================== LangChain + Cerebras Chat ====================
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyMuPDFLoader
from langchain.prompts import ChatPromptTemplate
from langchain.globals import set_llm_cache
from langchain_openai import ChatOpenAI
from langchain_qdrant import QdrantVectorStore
from langchain.schema import StrOutputParser
from databases.redis.redis_cache import semantic_cache

# ==================== Vector DB ====================
from databases.qdrant.qdrant_store import client as qdrant_client # Renamed to avoid conflict
from qdrant_client.http.models import Distance, VectorParams
from qdrant_client import QdrantClient # Import QdrantClient type

# ==================== Embedding Models ====================
from Models.Embedding_model.text_embedding import gemini_embed,bi_embed
from Models.Embedding_model.reranking_model import colBERT

# ==================== Initialize Chat Model ====================
CEREBRAS_API_KEY = os.getenv("CEREBRAS_API_KEY")

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def get_cerebras_llm() -> ChatOpenAI:
    """Initializes and returns the Cerebras LLM with retry."""
    return ChatOpenAI(
        base_url="https://api.cerebras.ai/v1",
        model="llama-4-scout-17b-16e-instruct",
        api_key=CEREBRAS_API_KEY,
        temperature=0.5
    )

llama_4_scout = get_cerebras_llm()
logger.info("Cerebras model qwen-3-32b initialized")

# ==================== Pydantic Models ====================
class DocumentQARequest(BaseModel):
    question: str
    document_id: str

class DocumentUploadResponse(BaseModel):
    document_id: str
    page_count: int
    message: str

class DocumentQAResponse(BaseModel):
    answer: str
    context: Optional[List[str]] = None


set_llm_cache(semantic_cache)
logger.info("Redis Semantic Cache initialized with the same embedding model being wrapped ")

# ==================== Vector Store Init ====================
@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def initialize_qdrant_collection(client: QdrantClient):
    """Initializes the Qdrant collection with retry."""
    collections = client.get_collections().collections
    if "demo_collection" not in [col.name for col in collections]:
        client.create_collection(
            collection_name="demo_collection",
            vectors_config=VectorParams(size=768, distance=Distance.COSINE),
        )
        logger.info("Created new Qdrant collection: demo_collection")
    else:
        logger.info("demo_collection already exists")

initialize_qdrant_collection(qdrant_client)

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def get_qdrant_vector_store(client: QdrantClient) -> QdrantVectorStore:
    """Initializes and returns Qdrant vector store with retry."""
    return QdrantVectorStore(client=client, collection_name="demo_collection", embedding=bi_embed)

vector_store = get_qdrant_vector_store(qdrant_client)
retriever = vector_store.as_retriever(search_type="mmr")
logger.info("Initialized vector store and retriever")

# ==================== Supabase User Authentication ====================
@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
async def get_supabase_user(supabase_client: Client, jwt_token: str) -> dict:
    """Authenticates user with Supabase JWT and returns user data with retry."""
    user_response = supabase_client.auth.get_user(jwt_token)
    logger.info(f"Supabase user response: {user_response}")
    if user_response.user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token") # Do not retry on invalid token
    return user_response.user

async def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    jwt_token = auth_header.split(" ")[1]
    # Use the retriable helper function
    return await get_supabase_user(supabase, jwt_token)

# ==================== Router Setup ====================
document_router = APIRouter(prefix="/api/v1", tags=["Document QA"])


# ==================== Upload Endpoint ====================
@document_router.post("/upload",response_model=DocumentUploadResponse)
async def upload_file(file: UploadFile = File(...), user = Depends(get_current_user)) -> JSONResponse:
    """
    Handles uploading of a PDF document and stores its content for future querying.

    This endpoint processes a user-uploaded PDF, splits it into manageable chunks,
    indexes the content into a vector store for semantic search, and stores metadata
    in the Supabase database.

    Args:
        file (UploadFile): The PDF file uploaded by the user. Must have a .pdf extension.
        user (dict): The current authenticated user, extracted via dependency injection.

    Returns:
        DocumentUploadResponse: Contains the document ID, page count, and success message.

    Raises:
        HTTPException: If the file is not a PDF (400),
                       or if the upload or processing fails (500).
    """
    logger.info(f"Received file upload request: {file.filename}")

    if not file.filename.endswith(".pdf"):
        logger.warning("Rejected non-PDF file upload attempt")
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        temp_file = Path(tempfile.gettempdir()) / f"{uuid4()}.pdf"
        content = await file.read()
        temp_file.write_bytes(content)
        logger.debug(f"Saved uploaded file to temporary path: {temp_file}")

        loader = PyMuPDFLoader(str(temp_file))
        documents = loader.load()
        logger.info(f"Loaded {len(documents)} document(s) from PDF")

        temp_file.unlink()  # cleanup
        logger.debug("Temporary file deleted after processing")

        splitter = RecursiveCharacterTextSplitter(separators=["\n\n"], chunk_size=1200, chunk_overlap=200)
        chunks = splitter.split_documents(documents)
        logger.info(f"Split document into {len(chunks)} chunk(s)")
        
        ids = [str(uuid4()) for _ in chunks]
        doc_id = str(uuid4())
        
        @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
        def add_documents_with_retry(docs, ids):
            """Adds documents to Qdrant with retry."""
            vector_store.add_documents(documents=docs, ids=ids)

        add_documents_with_retry(chunks, ids)
        logger.info(f"Indexed {len(ids)} chunks into vector store")
        doc_data = {
            "id": doc_id,
            "user_id": user.id,
            "page_count": len(documents),
            "uploaded_at": datetime.now().isoformat(),
        }

        @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
        def insert_document_metadata_with_retry(data):
            """Inserts document metadata into Supabase with retry."""
            return supabase.table("documents").insert(data).execute()

        insert_document_metadata_with_retry(doc_data)
    
        return DocumentUploadResponse(
            document_id=doc_id,
            page_count=len(documents),
            message="Document processed and stored successfully"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to upload document: {file.filename}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== Ask Endpoint ====================

@document_router.post("/ask", response_model=DocumentQAResponse)
async def ask_question(
    request: DocumentQARequest,
    user: dict = Depends(get_current_user)
):
    """
    Handles user questions on a previously uploaded PDF document.

    This endpoint:
    - Validates the user's access to the document.
    - Retrieves relevant document chunks via a vector retriever.
    - Passes the retrieved content and question to a language model.
    - Stores the generated answer along with the original question and context.

    Args:
        request (DocumentQARequest): Pydantic model containing:
            - document_id (str): ID of the uploaded document.
            - question (str): User's natural language question.
            - chat_history (List[Dict]): Optional previous Q&A interactions.
        user (dict): Authenticated user dictionary obtained via dependency.

    Returns:
        DocumentQAResponse: Contains the generated answer and the context used.

    Raises:
        HTTPException: If access is denied, document not found, or processing fails.
    """
    logger.info(f"Received question from user {user['id']}: {request.question}")

    try:
        # Step 1: Check document ownership
        @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
        def get_document_with_retry(doc_id, user_id):
            """Retrieves document from Supabase with retry."""
            return supabase.table("documents") \
                          .select("*") \
                          .eq("id", doc_id) \
                          .eq("user_id", user_id) \
                          .single() \
                          .execute()

        doc = get_document_with_retry(request.document_id, user["id"])

        if not doc.data:
            raise HTTPException(
                status_code=403,
                detail="You don't have access to this document."
            )

        # Step 2: Retrieve context
        @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
        def retrieve_docs_with_retry(query):
            """Retrieves relevant documents from vector store with retry."""
            return retriever.invoke(query)

        relevant_docs = retrieve_docs_with_retry(request.question)

        logger.debug(f"Retrieved {len(relevant_docs)} relevant document(s).")

        if not relevant_docs:
            return DocumentQAResponse(
                answer="Sorry, I couldn't find relevant content to answer this question.",
                context=[]
            )

        context = "".join([doc.page_content for doc in relevant_docs])
        logger.debug("Constructed context from retrieved documents.")

        # Step 3: Format prompt and invoke LLM
        prompt = ChatPromptTemplate.from_messages([
            ("system", """
You are an expert academic assistant and mentor, designed to help students deeply understand academic topics and succeed in their learning journey. 

You must:
- Answer questions **clearly and accurately** using only the provided study material (`{context}`).
- **Personalize** your responses — adapt to the student's tone, ask follow-up questions if needed, and address the student directly.
- If asked about **learning paths** or **how to start a topic**, provide a **step-by-step timeline**, **curated topic list**, or **study plan** tailored to the complexity of the topic and typical learning curves.
- If a student asks to **summarize** or **explain** a concept, do so in a way that's **simple**, **intuitive**, and **relatable**, possibly with analogies.
- Offer **action-driven suggestions**, such as:
    - "Next, you might want to look at Chapter 3 on Paging."
    - "Try summarizing this topic in your own words or make flashcards."
- If the material is missing or not sufficient, politely say that you need more context.
- When answering, **assume the student is curious and committed**, and speak like a helpful, inspiring tutor.

Always stay focused on `{context}`, and avoid making up facts not present in it. First and foremost, greet the student with a warm welcome calling their name: {name}, and then proceed with the answer.
"""),
            ("human", "{question}")
        ])

        @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
        def invoke_llm_with_retry(chain, input_data):
            """Invokes the language model with retry."""
            return chain.invoke(input_data)

        chain = prompt | llama_4_scout | StrOutputParser()
        answer = invoke_llm_with_retry(chain, {
            "question": request.question,
            "context": context,
            "name": user.get("user_metadata", {}).get("name", "Student")
        })

        # Step 4: Store Q&A in Supabase
        qa_data = {
            "id": str(uuid4()),
            "user_id": user["id"],
            "document_id": request.document_id,
            "question": request.question,
            "answer": answer,
            "context": [context],
            "created_at": datetime.now().isoformat()
        }

        @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
        def insert_qa_data_with_retry(data):
            """Inserts Q&A data into Supabase with retry."""
            supabase.table("document_qa").insert(data).execute()

        insert_qa_data_with_retry(qa_data)

        return DocumentQAResponse(
            answer=answer,
            context=[doc.page_content for doc in relevant_docs]
        )

    except HTTPException:
        raise  # propagate known errors
    except Exception as e:
        logger.exception(f"Question answering failed: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate answer. Please try again later."
        )
