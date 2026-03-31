from langchain_google_genai import GoogleGenerativeAIEmbeddings
from typing import List
from pydantic import SecretStr
from langchain_core.utils.utils import secret_from_env

import os

from dotenv import load_dotenv
load_dotenv()


gemini_embed = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-2-preview",api_key=os.getenv("GOOGLE_API_KEY"))


print(len(gemini_embed.embed_query("hey what is up")))
