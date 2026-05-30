from typing import List, Dict, Any
from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.config import settings
from app.models import Document, DocumentType
import tiktoken
import httpx


class OllamaEmbeddingClient:
    def __init__(self, base_url: str, model: str):
        self.base_url = base_url.rstrip("/")
        self.model = model

    async def aembed_documents(self, texts: List[str]) -> List[List[float]]:
        embeddings = []
        async with httpx.AsyncClient(timeout=60) as client:
            for text in texts:
                resp = await client.post(
                    f"{self.base_url}/api/embeddings",
                    json={"model": self.model, "prompt": text},
                )
                resp.raise_for_status()
                embeddings.append(resp.json()["embedding"])
        return embeddings

    async def aembed_query(self, query: str) -> List[float]:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                f"{self.base_url}/api/embeddings",
                json={"model": self.model, "prompt": query},
            )
            resp.raise_for_status()
            return resp.json()["embedding"]


def _get_embedding_client():
    if settings.llm_provider.lower().strip() == "ollama":
        return OllamaEmbeddingClient(
            base_url=settings.ollama_url,
            model=settings.ollama_embedding_model,
        )
    from app.bedrock import bedrock_embedding_client
    return bedrock_embedding_client


class EmbeddingPipeline:
    def __init__(self):
        self.embeddings = _get_embedding_client()
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
        self.encoding = tiktoken.get_encoding("cl100k_base")
    
    def chunk_document(self, document: Document) -> List[Dict[str, Any]]:
        """Chunk document with metadata preservation"""
        chunks = self.text_splitter.split_text(document.content)
        
        chunked_docs = []
        for idx, chunk in enumerate(chunks):
            chunked_docs.append({
                "content": chunk,
                "doc_id": document.id,
                "doc_type": document.doc_type.value,
                "chunk_index": idx,
                "metadata": document.metadata,
                "created_at": document.created_at
            })
        
        return chunked_docs
    
    def semantic_chunk(self, text: str, doc_type: DocumentType) -> List[str]:
        """Semantic chunking based on document type"""
        if doc_type == DocumentType.MENTOR_BIO:
            # Keep mentor bios as single chunks if under limit
            if len(self.encoding.encode(text)) < settings.chunk_size:
                return [text]
        
        elif doc_type == DocumentType.FAQ:
            # Split FAQs by Q&A pairs
            chunks = []
            pairs = text.split("\n\n")
            for pair in pairs:
                if pair.strip():
                    chunks.append(pair.strip())
            return chunks
        
        # Default recursive splitting
        return self.text_splitter.split_text(text)
    
    async def embed_chunks(self, chunks: List[str]) -> List[List[float]]:
        """Generate embeddings for chunks"""
        return await self.embeddings.aembed_documents(chunks)
    
    async def embed_query(self, query: str) -> List[float]:
        """Generate embedding for query"""
        return await self.embeddings.aembed_query(query)
    
    def count_tokens(self, text: str) -> int:
        """Count tokens in text"""
        return len(self.encoding.encode(text))
