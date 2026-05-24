"""Embedding metadata model for AI integration."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector

from app.core.database import Base


class EmbeddingMetadata(Base):
    """Store embeddings for semantic search."""
    __tablename__ = "embedding_metadata"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entity_type = Column(String(50), nullable=False)  # mentor, course, learner
    entity_id = Column(UUID(as_uuid=True), nullable=False)
    content = Column(Text, nullable=False)  # Original text that was embedded
    embedding = Column(Vector(1536))  # Vector dimension from settings
    model_name = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        {"postgresql_using": "ivfflat"},
    )
