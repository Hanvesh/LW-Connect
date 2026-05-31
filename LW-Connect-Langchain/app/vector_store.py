from typing import List, Dict, Any, Optional
import asyncpg
from pgvector.asyncpg import register_vector
from app.config import settings
from app.models import DocumentType
import json

class VectorStore:
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None
    
    async def initialize(self):
        """Initialize connection pool and setup tables"""
        self.pool = await asyncpg.create_pool(settings.database_url)
        
        async with self.pool.acquire() as conn:
            await conn.execute("CREATE EXTENSION IF NOT EXISTS vector")
            await register_vector(conn)
            
            # Create documents table
            await conn.execute(f"""
                CREATE TABLE IF NOT EXISTS documents (
                    id TEXT PRIMARY KEY,
                    content TEXT NOT NULL,
                    doc_type TEXT NOT NULL,
                    embedding vector({settings.vector_dimension}),
                    metadata JSONB,
                    chunk_index INTEGER,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """)
            
            # Create index for vector similarity search
            await conn.execute("""
                CREATE INDEX IF NOT EXISTS documents_embedding_idx 
                ON documents USING ivfflat (embedding vector_cosine_ops)
                WITH (lists = 100)
            """)
            
            # Create index for filtering
            await conn.execute("""
                CREATE INDEX IF NOT EXISTS documents_doc_type_idx 
                ON documents(doc_type)
            """)
    
    async def add_documents(self, chunks: List[Dict[str, Any]], embeddings: List[List[float]]):
        """Add documents with embeddings to vector store"""
        async with self.pool.acquire() as conn:
            await register_vector(conn)
            
            for chunk, embedding in zip(chunks, embeddings):
                await conn.execute("""
                    INSERT INTO documents (id, content, doc_type, embedding, metadata, chunk_index, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT (id) DO UPDATE SET
                        content = EXCLUDED.content,
                        embedding = EXCLUDED.embedding,
                        metadata = EXCLUDED.metadata
                """, 
                    f"{chunk['doc_id']}_chunk_{chunk['chunk_index']}",
                    chunk['content'],
                    chunk['doc_type'],
                    embedding,
                    json.dumps(chunk['metadata']),
                    chunk['chunk_index'],
                    chunk['created_at']
                )
    
    async def similarity_search(
        self, 
        query_embedding: List[float], 
        top_k: int = 5,
        doc_type: Optional[DocumentType] = None,
        metadata_filter: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Perform similarity search with optional filters"""
        async with self.pool.acquire() as conn:
            await register_vector(conn)
            
            query = """
                SELECT id, content, doc_type, metadata, 
                       1 - (embedding <=> $1) as similarity
                FROM documents
                WHERE 1=1
            """
            params = [query_embedding]
            param_idx = 2
            
            if doc_type:
                query += f" AND doc_type = ${param_idx}"
                params.append(doc_type.value)
                param_idx += 1
            
            if metadata_filter:
                for key, value in metadata_filter.items():
                    query += f" AND metadata->>'{key}' = ${param_idx}"
                    params.append(str(value))
                    param_idx += 1
            
            query += f" ORDER BY embedding <=> $1 LIMIT ${param_idx}"
            params.append(top_k)
            
            rows = await conn.fetch(query, *params)
            
            return [
                {
                    "id": row["id"],
                    "content": row["content"],
                    "doc_type": row["doc_type"],
                    "metadata": json.loads(row["metadata"]) if isinstance(row["metadata"], str) else (row["metadata"] or {}),
                    "similarity": float(row["similarity"])
                }
                for row in rows
            ]
    
    async def delete_document(self, doc_id: str):
        """Delete document and all its chunks"""
        async with self.pool.acquire() as conn:
            await conn.execute("DELETE FROM documents WHERE id LIKE $1", f"{doc_id}%")
    
    async def close(self):
        """Close connection pool"""
        if self.pool:
            await self.pool.close()

vector_store = VectorStore()
