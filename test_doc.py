# ==================== Standard Library ====================
import os
import sys
import tempfile
from typing import Optional, List
from uuid import uuid4
from datetime import datetime
from base64 import b64encode
from pathlib import Path  # Added Path from pathlib

from typing import List, Optional, Any
import requests
# ==================== Logging ====================
from loguru import logger

# ==================== Dotenv ====================
from dotenv import load_dotenv
load_dotenv()  # Load from .env file uploaded manually
logger.info("Loaded environment variables from .env")

from supabase import create_client, Client

# ==================== Langchain Imports ====================
from langchain.text_splitter import RecursiveCharacterTextSplitter

from langchain_community.document_loaders import PyMuPDFLoader
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_qdrant import QdrantVectorStore
from langchain.schema import StrOutputParser


# ==================== Vector DB ====================
from fastapi_backend.vector_databases.qdrant.qdrant_store import client
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams


# ==================== Environment Variables ====================
CEREBRAS_API_KEY = os.getenv("CEREBRAS_API_KEY")

# ==================== Embeddings ====================
from fastapi_backend.Models.Embedding_model.text_embedding import gem_embed
from fastapi_backend.Models.Embedding_model.reranking_model import colBERT
logger.info(f"Using text embedding model of dimensions : {len(gem_embed.embed_query('test'))}")
logger.info(f"Using ColBERT late interaction model for reranking has dimensions : {len(colBERT.embed_query('test'))}")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_PRIVATE")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# ==================== Chat Model ====================
qwen_32 = ChatOpenAI(
    base_url="https://api.cerebras.ai/v1",
    model="qwen-3-32b",
    api_key=CEREBRAS_API_KEY,
    temperature=0.5
)
logger.info("Cerebras model qwen-3-32b initialized")

# ==================== Document Store ====================
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

retriever = vector_store.as_retriever(search_type="mmr")
# ==================== File Upload Alternative ====================
# Using pathlib.Path for file handling instead of google.colab.files
pdf_path = Path(r"C:\Users\Raghu\Downloads\OS Module 4 Memory Management.pdf") 

if not pdf_path.exists():
    raise FileNotFoundError(f"PDF file not found at {pdf_path}")

file_content = pdf_path.read_bytes()

# Save uploaded file using pathlib.Path
upload_path = Path(tempfile.gettempdir()) / f"{uuid4()}.pdf"
upload_path.write_bytes(file_content)

# ==================== Load and Chunk ====================
loader = PyMuPDFLoader(str(upload_path))
documents = loader.load()
upload_path.unlink()  # Delete the temporary file after use

text_splitter = RecursiveCharacterTextSplitter(
    separators=["\n\n"], chunk_size=1200, chunk_overlap=200
)
chunks = text_splitter.split_documents(documents)

ids = [str(uuid4()) for _ in range(len(chunks))]
vector_store.add_documents(documents=chunks,ids=ids)


# ==================== Ask a Question ====================
question = input("Enter your question: ")

relevant_docs = retriever.invoke(question)
context = "".join([doc.page_content for doc in relevant_docs])

prompt = ChatPromptTemplate.from_messages([
("system", 
"""
You are an expert academic assistant and mentor, designed to help students deeply understand academic topics and succeed in their learning journey. 

You must:
- Answer questions **clearly and accurately** using only the provided study material (`{context}`).
- **Personalize** your responses — adapt to the student's tone, ask follow-up questions if needed, and address the student directly.
- If asked about **learning paths** or **how to start a topic**, provide a **step-by-step timeline**, **curated topic list**, or **study plan** tailored to the complexity of the topic and typical learning curves.
- If a student asks to **summarize** or **explain** a concept, do so in a way that’s **simple**, **intuitive**, and **relatable**, possibly with analogies.
- Offer **action-driven suggestions**, such as:
    - “Next, you might want to look at Chapter 3 on Paging.”
    - “Try summarizing this topic in your own words or make flashcards.”
- If the material is missing or not sufficient, politely say that you need more context.
- When answering, **assume the student is curious and committed**, and speak like a helpful, inspiring tutor.

Always stay focused on `{context}`, and avoid making up facts not present in it.
"""
),
    ("human", "{question}")
])
chain = prompt | qwen_32 | StrOutputParser()

answer = chain.invoke({
    "question": question,
    "context": context
})

print("\n=== Answer ===")
print(answer)