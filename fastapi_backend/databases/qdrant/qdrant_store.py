from qdrant_client import QdrantClient
import os
from dotenv import load_dotenv
load_dotenv()

client = QdrantClient(url=os.getenv("QDRANT_URL"))
print(client)