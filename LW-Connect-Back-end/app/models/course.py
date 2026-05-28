"""Course model."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ARRAY, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base


class Course(Base):
    """Course/Learning pathway model."""
    __tablename__ = "courses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    tags = Column(ARRAY(String))  # For search and categorization
    difficulty_level = Column(String(50))  # beginner, intermediate, advanced
    duration_hours = Column(Integer)
    is_published = Column(Boolean, default=False)
    prerequisites = Column(ARRAY(String))
    learning_outcomes = Column(ARRAY(String))
    content_url = Column(String(500))
    thumbnail_url = Column(String(500))
    extra_metadata = Column("metadata", JSONB, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    cohorts = relationship("Cohort", back_populates="course")
