from langchain_huggingface import HuggingFaceEmbeddings
import os



model_name = "colbert-ir/colbertv2.0"
model_kwargs = {'device': 'cpu'}
encode_kwargs = {'normalize_embeddings': False}
colBERT = HuggingFaceEmbeddings(
    model_name=model_name,
    model_kwargs=model_kwargs,
    encode_kwargs=encode_kwargs
)
embeds = colBERT.embed_query("hey what is up")
print(len(embeds))