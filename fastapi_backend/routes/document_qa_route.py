import os
import json
from uuid import uuid4
from datetime import datetime


from fastapi import APIRouter, UploadFile, File, Request, Depends, HTTPException, status

# ==================== FastAPI ====================

from fastapi import APIRouter, File, UploadFile, HTTPException, Form,Request,Depends
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
from tenacity import retry, wait_exponential, stop_after_attempt, stop_after_delay
from loguru import logger

from qdrant_client import QdrantClient
from qdrant_client.http.models import VectorParams, Distance

from langchain_qdrant import QdrantVectorStore
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain.globals import set_llm_cache
from langchain.schema import StrOutputParser
from langchain_neo4j import Neo4jChatMessageHistory

from mistralai import DocumentURLChunk, Mistral
from supabase import create_client, Client

from databases.neo4j.neo4j_client import graph
from Models.Embedding_model.text_embedding import bi_embed
from databases.redis.redis_cache import RedisSemanticCache

# === Load environment variables ===
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_PRIVATE")
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
mistral_client = Mistral(api_key=MISTRAL_API_KEY)

document_router = APIRouter(prefix="/api/v1", tags=["Document QA"])

# === Models ===
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


# === Vector Store & LLM Setup ===

qdrant_client =  QdrantClient(host="localhost", port=6333)
collection_name = "demo_collection"
existing_collections = qdrant_client.get_collections().collections
existing_names = [col.name for col in existing_collections]
if collection_name not in existing_names:
    qdrant_client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=384, distance=Distance.COSINE),
    )
else:
    print(f"Collection '{collection_name}' already exists.")
vector_store = QdrantVectorStore(
    client=qdrant_client,
    collection_name="demo_collection",
    embedding=bi_embed,
)
retriever = vector_store.as_retriever(search_kwargs={"k": 2})


chat_model = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    api_key=GOOGLE_API_KEY,
    temperature=0.4
)
# === Routes ===

@document_router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...), user=Depends(get_current_user)):
    document_id = str(uuid4())
    content = await file.read()

    # Upload file to Mistral
    uploaded_file = mistral_client.files.upload(
        file={"file_name": file.filename, "content": content}, purpose="ocr"
    )

    signed_url = mistral_client.files.get_signed_url(file_id=uploaded_file.id, expiry=1)

    # OCR processing
    pdf_response = mistral_client.ocr.process(
        document=DocumentURLChunk(document_url=signed_url.url),
        model="mistral-ocr-latest",
        include_image_base64=True
    )

    response_dict = json.loads(pdf_response.json())
    pages = response_dict.get("pages", [])
    if not pages:
        raise HTTPException(status_code=400, detail="No content extracted from PDF.")

    chunks = "\n".join(page["markdown"] for page in pages)

    # Text splitting and vector store
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    docs = splitter.create_documents([chunks])
    ids = [str(uuid4()) for _ in range(len(docs))]
    vector_store.add_documents(documents=docs, ids=ids)

    # Metadata to store in Supabase
    doc_data = {
        "id": document_id,
        "user_id": user.id,
        "page_count": len(docs),
        "uploaded_at": datetime.now().isoformat(),
        "filename": file.filename,
    }

    # Retry mechanism for insertion
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    def insert_document_metadata_with_retry(data):
        return supabase.table("documents").insert(data).execute()

    # Insert into Supabase
    insert_document_metadata_with_retry(doc_data)

    return DocumentUploadResponse(
        document_id=document_id,
        page_count=len(pages),
        message="Document uploaded and processed successfully."
    )

@document_router.post("/query", response_model=DocumentQAResponse)
async def ask_question(request: DocumentQARequest, user=Depends(get_current_user)):
    try:
        # Retry fetching the document metadata to verify access
        @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
        def get_document_with_retry(doc_id, user_id):
            return supabase.table("documents") \
                .select("*") \
                .eq("id", doc_id) \
                .eq("user_id", user_id) \
                .single() \
                .execute()

        doc_response = get_document_with_retry(request.document_id, user.id)
        if not doc_response or not doc_response.data:
            raise HTTPException(
                status_code=403,
                detail="You don't have access to this document."
            )

        # Retrieve relevant chunks from the vector store based on question
        context_docs = retriever.invoke(request.question)
        context = "\n".join(doc.page_content for doc in context_docs)

        # Helper to get chat history for the session
        def get_session_history(session_id: str) -> Neo4jChatMessageHistory:
            return Neo4jChatMessageHistory(session_id=session_id, graph=graph)

        # Define prompt template for chat model
        prompt = ChatPromptTemplate.from_messages([
            ("system", "Answer the following question on the given context : {context} "
                       "as well as from your base cut-off knowledge. "
                       "While answering the queries, also provide URL links to the documentation wherever necessary."),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{question}")
        ])

        chat_chain = prompt | chat_model | StrOutputParser()

        chat_with_history = RunnableWithMessageHistory(
            chat_chain,
            get_session_history,
            input_messages_key="question",
            history_messages_key="chat_history",
        )

        response = chat_with_history.invoke(
            {
                "question": request.question,
                "context": context
            },
            config={"configurable": {"session_id": user.id}}
        )

        # Prepare data for logging into Supabase
        qa_data = {
            "id": str(uuid4()),
            "user_id": user.id,
            "document_id": request.document_id,
            "question": request.question,
            "answer": response,
            "context": [context],
            "created_at": datetime.now().isoformat()
        }

        @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
        def insert_qa_data_with_retry(data):
            supabase.table("document_qa").insert(data).execute()

        insert_qa_data_with_retry(qa_data)

        return DocumentQAResponse(
            answer=response,
            context=[doc.page_content for doc in context_docs]
        )
        
    except Exception as e:
        logger.error(f"Query failed: {e}")
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")
