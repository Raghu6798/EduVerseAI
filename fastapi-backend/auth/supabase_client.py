# === Standard Library Imports ===
import os
import sys
import tempfile
import traceback
from typing import Optional, List
from uuid import uuid4
from datetime import datetime
from base64 import b64encode

# === Third-Party Imports ===
from dotenv import load_dotenv
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Request, Depends,FastAPI
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from loguru import logger

# Langchain-related
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_community.vectorstores import FAISS
from langchain_community.docstore import InMemoryDocstore
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.prompts import ChatPromptTemplate
from langchain_cerebras import ChatCerebras
from langchain.schema import StrOutputParser

# Vector DB
import faiss

# Supabase
from supabase import create_client, Client

# === Local Imports ===
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import config  # noqa

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
EMBEDDING_MODEL = "sentence-transformers/all-mpnet-base-v2"
embeddings = HuggingFaceEmbeddings(
    model_name=EMBEDDING_MODEL,
    model_kwargs={"device": "cpu"},
    encode_kwargs={"normalize_embeddings": True}
)
logger.info(f"Using embedding model: {EMBEDDING_MODEL}")
app=FastAPI()
# === Chat Model Initialization ===
qwen_32 = ChatCerebras(
    model="qwen-3-32b",
    api_key=os.getenv("CEREBRAS_API_KEY"),
    temperature=0.5
)
logger.info("Cerebras model qwen-3-32b initialized")

# === In-memory Document Store ===
document_stores = {}

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

# === Question Answering Endpoint ===
@document_router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    user = Depends(get_current_user)
):
    try:
        if not is_pdf_file(file):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")

        # Read file content
        file_content = await file.read()
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid4()}{file_extension}"
        
        # Upload to Supabase Storage
        storage_response = supabase.storage.from_("user-pdf").upload(
            file=file_content,
            path=f"{user.id}/{unique_filename}",  # Organize by user ID
            file_options={
                "content-type": "application/pdf",
                "upsert": False
            }
        )
        logger.info(f"Storage upload response: {storage_response}")
        logger.info(f"Storage upload response dict: {storage_response.__dict__}")

        if storage_response.error is not None:
            raise HTTPException(
        status_code=500,
        detail=f"Failed to upload to storage: {storage_response.error.message}"
    )


        # Get public URL (optional)
        file_url = supabase.storage.from_("user-pdf").get_public_url(f"{user.id}/{unique_filename}")

        # Process the document
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            temp_file.write(file_content)
            temp_path = temp_file.name

        loader = PyMuPDFLoader(temp_path)
        documents = loader.load()
        os.remove(temp_path)

        if not documents:
            raise HTTPException(status_code=400, detail="Could not extract any text from the PDF")

        # Create vector store
        text_splitter = RecursiveCharacterTextSplitter(separators=["\n\n"], chunk_size=1200, chunk_overlap=200)
        chunks = text_splitter.split_documents(documents)

        embedding_dim = len(embeddings.embed_query("test"))
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

        # Store metadata in documents table
        doc_data = {
            "id": doc_id,
            "user_id": user.id,
            "page_count": len(documents),
            "uploaded_at": datetime.now().isoformat(),
            "file_path": f"user-pdf/{user.id}/{unique_filename}",  # Storage path
            "file_url": file_url,  # Public URL if needed
            "original_filename": file.filename  # Original filename
        }

        result = supabase.table("documents").insert(doc_data).execute()
        
        if hasattr(result, 'error') and result.error:
            # Attempt to delete the file if DB insert failed
            supabase.storage.from_("user-pdf").remove([f"{user.id}/{unique_filename}"])
            raise Exception(result.error.message)

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
    
app.include_router(document_router)