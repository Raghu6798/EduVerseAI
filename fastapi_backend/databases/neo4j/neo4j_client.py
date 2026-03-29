from langchain_neo4j import GraphCypherQAChain, Neo4jGraph

import os
from dotenv import load_dotenv
load_dotenv()

graph = Neo4jGraph(
    url=os.getenv("NEO4J_URL"), 
    username=os.getenv("NEO4J_USER"), 
    password=os.getenv("NEO4J_PASSWORD")
)
print(graph)

