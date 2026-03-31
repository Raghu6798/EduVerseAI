import os,sys

from langchain_neo4j import GraphCypherQAChain, Neo4jGraph
from loguru import logger 
from dotenv import load_dotenv
load_dotenv()

logger.remove()
logger.add(sys.stderr, level="DEBUG", format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>", serialize=True)

try:
    graph = Neo4jGraph(
        url=os.getenv("NEO4J_URL"),
        username=os.getenv("NEO4J_USER"),
        password=os.getenv("NEO4J_PASSWORD"),
        database="neo4j",
        refresh_schema=False 
    )
except Exception as e:
    logger.warning(f"Failed to connect to default 'neo4j' database, trying discovery: {e}")
    graph = Neo4jGraph(
        url=os.getenv("NEO4J_URL"),
        username=os.getenv("NEO4J_USER"),
        password=os.getenv("NEO4J_PASSWORD")
    )
print(graph)
