import os
from pathlib import Path
from dotenv import load_dotenv
from typing import Optional

# Get the project root directory
ROOT_DIR = Path(__file__).parent.parent

# Load environment variables
env_path = ROOT_DIR / '.env'
load_dotenv(env_path)

class Settings:
    # Environment
    ENV: str = os.getenv('ENV', 'development')
    
    # API Keys
    SUPABASE_URL: str = os.getenv('SUPABASE_URL', '')
    SUPABASE_ANON_KEY: str = os.getenv('SUPABASE_KEY', '')
    COHERE_API_KEY: str = os.getenv('COHERE_API_KEY', '')
    GROQ_API_KEY: str = os.getenv('GROQ_API_KEY', '')
    MISTRAL_API_KEY: str = os.getenv('MISTRAL_API_KEY', '')
    GOOGLE_API_KEY: str = os.getenv('GOOGLE_API_KEY', '')
    CEREBRAS_API_KEY: str = os.getenv('CEREBRAS_API_KEY', '')
    SERP_API_KEY: str = os.getenv('SERP_API_KEY', '')
    MEMZERO_API_KEY: str = os.getenv('MEMZERO_API_KEY', '')

    # Database
    QDRANT_URL: str = os.getenv('QDRANT_URL', 'http://localhost:6333')
    REDIS_URL: str = os.getenv('REDIS_URL', 'redis://localhost:6379')

    # Model Settings
    DEFAULT_EMBEDDING_MODEL: str = 'gemini-embedding-exp-03-07'
    DEFAULT_CHAT_MODEL: str = 'qwen-3-32b'

    @classmethod
    def validate(cls) -> None:
        """Validate required settings."""
        required_vars = [
            'SUPABASE_URL',
            'SUPABASE_ANON_KEY',
            'GOOGLE_API_KEY',
            'CEREBRAS_API_KEY'
        ]
        
        missing = [var for var in required_vars if not getattr(cls, var)]
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")

# Create settings instance
settings = Settings()

# Validate settings on import
settings.validate() 