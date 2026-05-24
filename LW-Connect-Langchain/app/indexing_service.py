from typing import List
from app.models import Document, DocumentType
from app.embedding_pipeline import EmbeddingPipeline
from app.vector_store import vector_store
import logging

logger = logging.getLogger(__name__)

class IndexingService:
    def __init__(self):
        self.embedding_pipeline = EmbeddingPipeline()
    
    async def index_documents(self, documents: List[Document]):
        """Index documents into vector store"""
        logger.info(f"Indexing {len(documents)} documents")
        
        for doc in documents:
            try:
                # Chunk document
                chunks = self.embedding_pipeline.chunk_document(doc)
                
                # Extract text for embedding
                chunk_texts = [chunk["content"] for chunk in chunks]
                
                # Generate embeddings
                embeddings = await self.embedding_pipeline.embed_chunks(chunk_texts)
                
                # Store in vector DB
                await vector_store.add_documents(chunks, embeddings)
                
                logger.info(f"Indexed document {doc.id} with {len(chunks)} chunks")
            
            except Exception as e:
                logger.error(f"Error indexing document {doc.id}: {e}")
                raise
    
    async def index_single_document(self, document: Document):
        """Index a single document"""
        await self.index_documents([document])
    
    async def delete_document(self, doc_id: str):
        """Delete document from index"""
        await vector_store.delete_document(doc_id)
        logger.info(f"Deleted document {doc_id}")
    
    async def reindex_all(self, documents: List[Document]):
        """Reindex all documents (useful for updates)"""
        logger.info("Starting full reindex")
        
        # Delete existing
        for doc in documents:
            await self.delete_document(doc.id)
        
        # Reindex
        await self.index_documents(documents)
        
        logger.info("Reindex complete")

indexing_service = IndexingService()
