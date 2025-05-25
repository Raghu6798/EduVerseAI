import os
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Body, Depends, Request
from supabase import create_client, Client
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import base64
import httpx
import mimetypes
from uuid import uuid4
from io import BytesIO
from datetime import datetime

from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.docstore import InMemoryDocstore
from langchain.schema import StrOutputParser
from langchain.prompts import ChatPromptTemplate
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
import faiss
from google import genai
from loguru import logger

image_router = APIRouter(
    prefix="/image-qa",
    tags=["Image Question Answering"]
)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_PRIVATE")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
logger.info(f"Supabase initialized with URL: {SUPABASE_URL}")

# Pydantic models
class ImageUploadResponse(BaseModel):
    image_id: str
    description: str
    message: str

class ImageQARequest(BaseModel):
    image_id: str
    question: str

class ImageQAResponse(BaseModel):
    answer: str
    context: Optional[list[str]] = None
    qa_id: str

# Initialize models and stores
model_name = "sentence-transformers/all-mpnet-base-v2"
embeddings = HuggingFaceEmbeddings(
    model_name=model_name,
    model_kwargs={'device': 'cpu'},
    encode_kwargs={'normalize_embeddings': False}
)

llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    temperature=0.8,
    verbose=True,
    api_key=os.getenv("GOOGLE_API_KEY")
)

image_stores = {}

def process_image(image_data: str, mime_type: str = "image/jpeg") -> str:
    logger.info(f"Starting image processing with mime type: {mime_type}")
    try:
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            logger.error("GOOGLE_API_KEY not set for image processing")
            raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not set")
        
        client = genai.Client(api_key=api_key)
        image_bytes = base64.b64decode(image_data)
        logger.info("Decoded image data")
        
        # Create a temporary file from the bytes
        import tempfile
        
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as temp_file:
            temp_file.write(image_bytes)
            temp_file_path = temp_file.name
        logger.info(f"Created temporary file: {temp_file_path}")
        
        # Upload the file directly as shown in the example
        my_file = client.files.upload(file=temp_file_path)
        logger.info(f"Uploaded file to Google GenAI: {temp_file_path}")
        
        # Generate content using the uploaded file
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[my_file, "Describe this image in detail."]
        )
        logger.info("Generated content description from image")
        
        # Clean up the temporary file
        os.unlink(temp_file_path)
        logger.info(f"Removed temporary file: {temp_file_path}")
        
        logger.info("Image processing completed successfully")
        return response.text
    except Exception as e:
        logger.error(f"Gemini processing error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Gemini processing error: {str(e)}"
        )

async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    jwt_token = auth_header.split(" ")[1]
    user_response = supabase.auth.get_user(jwt_token)
    print(user_response)
    logger.info(f"The user response is : {user_response}")
    if user_response.user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user_response.user

@image_router.post("/upload", response_model=ImageUploadResponse)
async def upload_image(
    request: Request,
    file: UploadFile = File(None),
    url: Optional[str] = None,
    description: Optional[str] = None,
    message: Optional[str] = None,
    user=Depends(get_current_user)
):
    logger.info(f"Received image upload request from user {user.id}. File: {file.filename if file else 'None'}, URL: {url if url else 'None'}")
    
    if not file and not url:
        logger.warning("No file or URL provided for image upload")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either file or URL must be provided"
        )

    try:
        image_data = None
        mime_type = "image/jpeg"

        if file:
            contents = await file.read()
            mime_type = file.content_type or mimetypes.guess_type(file.filename)[0] or "image/jpeg"
            image_data = base64.b64encode(contents).decode("utf-8")
            logger.info(f"Read and encoded image file: {file.filename}")
        elif url:
            async with httpx.AsyncClient() as client:
                response = await client.get(url)
                response.raise_for_status()
                mime_type = response.headers.get("content-type", "image/jpeg")
                if ";" in mime_type:  # Handle cases like "image/jpeg;charset=UTF-8"
                    mime_type = mime_type.split(";")[0]
                image_data = base64.b64encode(response.content).decode("utf-8")
            logger.info(f"Downloaded and encoded image from URL: {url}")

        # Process image if description not provided
        if not description:
            description = process_image(image_data, mime_type)
            logger.info("Obtained image description from process_image")

        # Create vector store from description
        knowledge = [Document(page_content=description)]
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=200)
        chunks = text_splitter.split_documents(knowledge)
        logger.info(f"Split image description into {len(chunks)} chunks")

        dim = len(embeddings.embed_query("hello world"))
        index = faiss.IndexFlatL2(dim)
        logger.info("Initialized FAISS index")

        vector_store = FAISS(
            embedding_function=embeddings,
            index=index,
            docstore=InMemoryDocstore(),
            index_to_docstore_id={},
        )

        ids = [str(uuid4()) for _ in chunks]
        docs_with_ids = [
            Document(page_content=chunk.page_content, metadata={"id": doc_id})
            for chunk, doc_id in zip(chunks, ids)
        ]

        vector_store.add_documents(docs_with_ids)
        logger.info(f"Added {len(docs_with_ids)} documents to vector store")

        image_id = str(uuid4())
        image_stores[image_id] = vector_store
        logger.info(f"Created image store with ID: {image_id}")

        # Store in database
        image_record = {
            "id": image_id,
            "user_id": user.id,
            "description": description,
            "message": message or "Image processed successfully",
            "uploaded_at": datetime.now().isoformat()
        }
        
        result = supabase.table("images").insert(image_record).execute()
        if hasattr(result, 'error') and result.error:
            raise HTTPException(status_code=500, detail=f"Database error: {result.error.message}")
        
        logger.info(f"Stored image record in database with ID: {image_id}")

        logger.info(f"Image upload and processing successful for ID: {image_id}")
        return ImageUploadResponse(
            image_id=image_id,
            description=description,
            message="Image processed successfully"
        )

    except HTTPException:
        logger.exception("HTTPException occurred during image upload")
        raise
    except Exception as e:
        logger.exception(f"Error processing image upload: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing image: {str(e)}"
        )

@image_router.post("/ask", response_model=ImageQAResponse)
async def ask_image(
    request: Request,
    qa_request: ImageQARequest = Body(...)
):
    user = await get_current_user(request)
    logger.info(f"Received image QA request from user {user.id} for image ID: {qa_request.image_id}")
    
    # Verify image exists in database
    image_result = supabase.table("images").select("*").eq("id", qa_request.image_id).execute()
    if not image_result.data or len(image_result.data) == 0:
        logger.warning(f"Image ID not found in database: {qa_request.image_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image ID not found"
        )
    
    if qa_request.image_id not in image_stores:
        logger.warning(f"Image ID not found in memory stores: {qa_request.image_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image data not loaded in memory"
        )

    try:
        vector_store = image_stores[qa_request.image_id]
        retriever = vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 6}
        )
        logger.info("Initialized vector store retriever")

        retrieved_docs = retriever.invoke(qa_request.question)
        context = "\n".join(doc.page_content for doc in retrieved_docs)
        logger.info(f"Retrieved {len(retrieved_docs)} documents for question")

        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert image analyst. Use this context: {context}"),
            ("human", "{question}")
        ])
        chain = prompt | llm | StrOutputParser()
        logger.info("Created prompt and chain for LLM")

        response = chain.invoke({
            "question": qa_request.question,
            "context": context
        })
        logger.info("Invoked LLM chain to get answer")

        # Store QA in database
        qa_id = str(uuid4())
        qa_record = {
            "id": qa_id,
            "user_id": user.id,
            "image_id": qa_request.image_id,
            "question": qa_request.question,
            "answer": response,
            "context": [context],
            "created_at": datetime.now().isoformat()
        }
        
        result = supabase.table("image_qa").insert(qa_record).execute()
        if hasattr(result, 'error') and result.error:
            raise HTTPException(status_code=500, detail=f"Database error: {result.error.message}")
        
        logger.info(f"Stored QA record in database with ID: {qa_id}")

        logger.info(f"Image QA request successful for image ID: {qa_request.image_id}")
        return ImageQAResponse(
            answer=response,
            context=[doc.page_content for doc in retrieved_docs],
            qa_id=qa_id
        )

    except Exception as e:
        logger.exception(f"Error answering question for image ID {qa_request.image_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error answering question: {str(e)}"
        )