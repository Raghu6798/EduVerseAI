from langchain_neo4j import GraphCypherQAChain, Neo4jGraph

graph = Neo4jGraph(url="bolt://localhost:7687", username="neo4j", password="password")
print(graph)

