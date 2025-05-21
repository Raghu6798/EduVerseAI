import sys
import os

# Add the root folder to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(os.path.dirname(os.path.dirname(current_dir)))
sys.path.append(root_dir)

from fastapi_backend.config.settings import settings
from langchain_google_genai import GoogleGenerativeAIEmbeddings

gem_embed = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-exp",
    google_api_key=settings.GOOGLE_API_KEY,
)
