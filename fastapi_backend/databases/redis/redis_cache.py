import redis
from langchain_redis import RedisSemanticCache

from langchain.embeddings.base import Embeddings
from typing import List
from pydantic import SecretStr
from langchain_core.utils.utils import secret_from_env
from langchain_huggingface import HuggingFaceEmbeddings
import os

from dotenv import load_dotenv
load_dotenv()

REDIS_URL = os.getenv("REDIS_URL")

bi_embed = HuggingFaceEmbeddings(   
    model_name="roberta-base-nli-stsb-mean-tokens",
    model_kwargs={"device": "cpu"}
)


semantic_cache = RedisSemanticCache(
    redis_url=REDIS_URL, embeddings=bi_embed, distance_threshold=0.2
)
