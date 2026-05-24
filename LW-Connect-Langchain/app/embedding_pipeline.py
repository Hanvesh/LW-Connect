from typing import List, Dict, Any
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from app.config import settings
from app.models import Document, DocumentType
import tiktoken

class EmbeddingPipeline:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            model=settings.embedding_model,
            openai_api_key=settings.openai_api_key
        )
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
