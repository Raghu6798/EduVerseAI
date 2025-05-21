import os
from dotenv import load_dotenv

load_dotenv()  # Load variables from .env file

class Config:
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_ANON_KEY = os.getenv("SUPABASE_KEY")

    COHERE_API_KEY = os.getenv("COHERE_API_KEY")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    CEREBRAS_API_KEY=os.getenv('CEREBRAS_API_KEY')

    SERP_API_KEY = os.getenv("SERP_API_KEY")
    MEMZERO_API_KEY = os.getenv("MEMZERO_API_KEY")


config = Config()