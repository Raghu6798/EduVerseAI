from typing import Dict, Any, Optional
from pydantic_settings import BaseSettings
from functools import lru_cache
from . import Settings, settings
import os

class BaseConfig(BaseSettings):
    """Base configuration class with common settings."""
    
    # Application Settings
    APP_NAME: str = "Multimodal RAG"
    DEBUG: bool = False
    API_V1_STR: str = "/api/v1"
    
    # CORS Settings
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]  # Frontend URL
    CORS_CREDENTIALS: bool = True
    CORS_METHODS: list[str] = ["*"]
    CORS_HEADERS: list[str] = ["*"]

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # Cache Settings
    CACHE_TTL: int = 3600  # 1 hour in seconds
    CACHE_PREFIX: str = "rag_cache:"
    
    # Model Settings
    MAX_TOKENS: int = 4096
    TEMPERATURE: float = 0.7
    TOP_P: float = 0.95
    
    # Vector Store Settings
    VECTOR_DIM: int = 1536
    COLLECTION_NAME: str = "document_store"
    
    # File Upload Settings
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: set[str] = {"pdf", "txt", "jpg", "jpeg", "png", "mp4"}
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"  # Allow extra fields from environment variables

class DevelopmentConfig(BaseConfig):
    """Development environment configuration."""
    DEBUG: bool = True
    LOG_LEVEL: str = "DEBUG"
    
    # Development-specific settings
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]

class ProductionConfig(BaseConfig):
    """Production environment configuration."""
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    
    # Production-specific settings
    CORS_ORIGINS: list[str] = [
        "https://your-production-domain.com"
    ]
    
    # Stricter rate limiting in production
    RATE_LIMIT_PER_MINUTE: int = 30

class TestingConfig(BaseConfig):
    """Testing environment configuration."""
    DEBUG: bool = True
    TESTING: bool = True
    
    # Test-specific settings
    CORS_ORIGINS: list[str] = ["http://test.localhost"]
    CACHE_TTL: int = 0  # Disable caching during tests
    
    # Use in-memory databases for testing
    QDRANT_URL: str = "http://localhost:6333"
    REDIS_URL: str = "redis://localhost:6379"

# Environment configuration mapping
config_by_env: Dict[str, BaseConfig] = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig
}

@lru_cache()
def get_settings() -> BaseConfig:
    """Get settings for current environment."""
    env = settings.ENV
    config_class = config_by_env.get(env, DevelopmentConfig)
    return config_class()

# Create settings instance
app_settings = get_settings()

# Additional utility functions
def get_model_settings(model_name: Optional[str] = None) -> Dict[str, Any]:
    """Get settings for a specific model or default model."""
    return {
        "model": model_name or settings.DEFAULT_CHAT_MODEL,
        "temperature": app_settings.TEMPERATURE,
        "max_tokens": app_settings.MAX_TOKENS,
        "top_p": app_settings.TOP_P
    }

def get_embedding_settings() -> Dict[str, Any]:
    """Get settings for embedding model."""
    return {
        "model": settings.DEFAULT_EMBEDDING_MODEL,
        "dimensions": app_settings.VECTOR_DIM
    }

class Settings:
    """Core settings for sensitive data and API keys."""
    # Environment
    ENV: str = os.getenv('ENV', 'development')
    
    # Supabase Configuration
    SUPABASE_URL: str = os.getenv('SUPABASE_URL', '')
    SUPABASE_SERVICE_ROLE_PRIVATE: str = os.getenv('SUPABASE_SERVICE_ROLE_PRIVATE', '')
    
    # LLM API Keys
    CEREBRAS_API_KEY: str = os.getenv('CEREBRAS_API_KEY', '')
    GOOGLE_API_KEY: str = os.getenv('GOOGLE_API_KEY', '')
    GROQ_API_KEY: str = os.getenv('GROQ_API_KEY', '')

    @classmethod
    def validate(cls) -> None:
        """Validate required environment variables."""
        required_vars = [
            'SUPABASE_URL',
            'SUPABASE_SERVICE_ROLE_PRIVATE',
            'CEREBRAS_API_KEY',
            'GOOGLE_API_KEY',
            'GROQ_API_KEY'
        ]
        
        missing = [var for var in required_vars if not getattr(cls, var)]
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")

# Create settings instance and validate
settings = Settings()
settings.validate() 