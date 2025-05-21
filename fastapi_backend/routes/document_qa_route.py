# === Standard Library Imports ===
import os

import tempfile
import traceback
from typing import Optional, List
from uuid import uuid4
from datetime import datetime
from base64 import b64encode

# === Third-Party Imports ===
from dotenv import load_dotenv
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from loguru import logger

# Langchain-related
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyMuPDFLoader
from Models.Embedding_model.text_embedding import gem_embed
from Models.Embedding_model.reranking_model import colBERT
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.prompts import ChatPromptTemplate

from langchain.schema import StrOutputParser

from vector_databases.qdrant.qdrant_store import client
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
# Supabase
from supabase import create_client, Client



# === Load environment variables ===
load_dotenv()

# === FastAPI Router ===
document_router = APIRouter(
    prefix="/document-qa",
    tags=["Document Question Answering"]
)

# === Supabase Client Initialization ===
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_PRIVATE")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
logger.info(f"Supabase initialized with URL: {SUPABASE_URL}")

# === Embedding Model Initialization ===

client.create_collection(
    collection_name="demo_collection",
    vectors_config=VectorParams(size=768, distance=Distance.COSINE),
)

vector_store = QdrantVectorStore(
    client=client,
    collection_name="demo_collection",
    embedding=gem_embed,
)
logger.info(f"Qdrant Store initalized : {vector_store}")
# === Chat Model Initialization ===

# === Pydantic Models ===
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

# === Helper Function ===
def is_pdf_file(file: UploadFile) -> bool:
    return file.content_type == "application/pdf"

# === Auth Helper ===
async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    jwt_token = auth_header.split(" ")[1]
    user_response = supabase.auth.get_user(jwt_token)
    logger.info(f"The user response is : {user_response}")
    if user_response.user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user_response.user

# === Upload Endpoint ===
@document_router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    user = Depends(get_current_user)
):
    try:
        if not is_pdf_file(file):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")

        file_content = await file.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            temp_file.write(file_content)
            temp_path = temp_file.name

        loader = PyMuPDFLoader(temp_path)
        documents = loader.load()
        os.remove(temp_path)

        if not documents:
            raise HTTPException(status_code=400, detail="Could not extract any text from the PDF")

        text_splitter = RecursiveCharacterTextSplitter(separators=["\n\n"], chunk_size=1200, chunk_overlap=200)
        chunks = text_splitter.split_documents(documents)

        embedding_dim = len(gem_embed.embed_query("test"))
        index = faiss.IndexFlatL2(embedding_dim)
        vector_store = FAISS(
            embedding_function=embeddings,
            index=index,
            docstore=InMemoryDocstore(),
            index_to_docstore_id={}
        )

        doc_id = str(uuid4())
        ids = [str(uuid4()) for _ in chunks]
        vector_store.add_documents(chunks, ids=ids)
        for idx, chunk_id in enumerate(ids):
            vector_store.index_to_docstore_id[idx] = chunk_id

        document_stores[doc_id] = vector_store

        file_base64 = b64encode(file_content).decode("utf-8")
        doc_data = {
            "id": doc_id,
            "user_id": user.id,  # Set the authenticated user ID
            "page_count": len(documents),
            "uploaded_at": datetime.now().isoformat(),
            "file_path": file_base64
        }

 
        result = supabase.table("documents").insert(doc_data).execute()
        logger.info(f"Supabase insert result: {result}")

        if hasattr(result, 'error') and result.error:
            raise Exception(result.error.message)

        return DocumentUploadResponse(
            document_id=doc_id,
            page_count=len(documents),
            message="Document processed and stored in DB successfully"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to upload document: {file.filename}")
        raise HTTPException(status_code=500, detail=str(e))

# === Question Answering Endpoint ===
@document_router.post("/ask", response_model=DocumentQAResponse)
async def ask_document(request: DocumentQARequest, user=Depends(get_current_user)):
    try:
        # Ensure user has access to the document
        doc_data = supabase.table("documents").select("*").eq("id", request.document_id).eq("user_id", str(user.id)).execute()
        if not doc_data.data:
            raise HTTPException(status_code=403, detail="You don't have access to this document")

        if request.document_id not in document_stores:
            raise HTTPException(status_code=404, detail="Document not found")

        vector_store = document_stores[request.document_id]
        retriever = vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 3})
        retrieved_docs = retriever.invoke(request.question)
        context = "\n".join(doc.page_content for doc in retrieved_docs)

        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert document analyst. Answer questions based on: {context}"),
            ("human", "{question}")
        ])
        chain = prompt | qwen_32 | StrOutputParser()

        answer = await chain.ainvoke({
            "question": request.question,
            "context": context
        })

        supabase.table("document_qa").insert({
            "user_id": str(user.id),
            "document_id": request.document_id,
            "question": request.question,
            "answer": answer,
            "context": [doc.page_content for doc in retrieved_docs]
        }).execute()

        return DocumentQAResponse(
            answer=answer,
            context=[doc.page_content for doc in retrieved_docs]
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error answering question for document {request.document_id}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
