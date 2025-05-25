from langchain.embeddings.base import Embeddings
from typing import List
from pydantic import SecretStr
from langchain_core.utils.utils import secret_from_env
import google.generativeai as genai
from langchain_huggingface import HuggingFaceEmbeddings
import os

from dotenv import load_dotenv
load_dotenv()

class GeminiEmbeddings(Embeddings):
    """
    Google Gemini Embeddings using the Generative AI SDK.
    """

    def __init__(self, model: str = "models/embedding-001", api_key: SecretStr = None):
        self.model = model
        self.api_key = api_key or SecretStr(os.getenv("GOOGLE_API_KEY")
        )
        if not self.api_key:
            raise ValueError("Missing Google API Key. Please set GOOGLE_API_KEY.")
        
        genai.configure(api_key=self.api_key.get_secret_value())
        self.client = genai

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """
        Embed a list of texts/documents.
        """
        embeddings = []
        for text in texts:
            res = self.client.embed_content(
                model=self.model,
                content=text,
                task_type="retrieval_document"
            )
            embeddings.append(res["embedding"])
        return embeddings

    def embed_query(self, text: str) -> List[float]:
        """
        Embed a single query string.
        """
        res = self.client.embed_content(
            model=self.model,
            content=text,
            task_type="retrieval_query"
        )
        return res["embedding"]

gemini_embed = GeminiEmbeddings()
bi_embed = HuggingFaceEmbeddings(   
    model_name="roberta-base-nli-stsb-mean-tokens",
    model_kwargs={"device": "cpu"}
)

