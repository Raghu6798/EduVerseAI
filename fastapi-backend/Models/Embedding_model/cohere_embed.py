import os 

from langchain_cohere import CohereEmbeddings
from dotenv import load_dotenv
import time 


load_dotenv()
start_time = time.time()
embeddings = CohereEmbeddings(
    model="embed-v4.0",
    cohere_api_key=os.getenv("COHERE_API_KEY"),
    )

vector = embeddings.embed_query("Hey What is up")
end_time = time.time()
embed_time = end_time - start_time
print(type(vector))
print(embed_time)