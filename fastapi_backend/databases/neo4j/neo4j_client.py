import os,sys

from langchain_neo4j import GraphCypherQAChain, Neo4jGraph
from loguru import logger 
from dotenv import load_dotenv
load_dotenv()

logger.remove()
logger.add(sys.stderr, level="DEBUG", format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>", serialize=True)

# Get Neo4j connection info
neo4j_uri = os.getenv("NEO4J_URI") or os.getenv("NEO4J_URL")
neo4j_user = os.getenv("NEO4J_USER")
neo4j_pass = os.getenv("NEO4J_PASSWORD")

logger.info(f"Connecting to Neo4j at: {neo4j_uri} as user: {neo4j_user}")

try:
    graph = Neo4jGraph(
        url=neo4j_uri,
        username=neo4j_user,
        password=neo4j_pass,
        database=None,
        refresh_schema=False 
    )
    logger.success("Successfully initialized Neo4j graph object")
except Exception as e:
    logger.warning(f"Neo4j initialization failed: {e}")
    graph = Neo4jGraph(
        url=neo4j_uri,
        username=neo4j_user,
        password=neo4j_pass
    )
print(graph)
