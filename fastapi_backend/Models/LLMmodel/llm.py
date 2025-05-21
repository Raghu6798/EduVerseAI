import sys
import os

# Add the root folder to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(os.path.dirname(os.path.dirname(current_dir)))
sys.path.append(root_dir)

from fastapi_backend.config.settings import settings
from langchain_openai import ChatOpenAI
from loguru import logger

qwen_32 = ChatOpenAI(
    base_url="https://api.cerebras.ai/v1",
    model="qwen-3-32b",
    api_key=settings.CEREBRAS_API_KEY,
    temperature=0.5
)
logger.info("Cerebras model qwen-3-32b initialized")