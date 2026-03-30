from langchain_google_genai import GoogleGenerativeAIEmbeddings
from typing import List
from pydantic import SecretStr
from langchain_core.utils.utils import secret_from_env
from langchain_huggingface import HuggingFaceEmbeddings
import os

from dotenv import load_dotenv
load_dotenv()


gemini_embed = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-2-preview",api_key=os.getenv("GOOGLE_API_KEY"))
bi_embed = HuggingFaceEmbeddings(   
    model_name="roberta-base-nli-stsb-mean-tokens",
    model_kwargs={"device": "cpu"}
)

print(len(gemini_embed.embed_query("hey what is up")))
