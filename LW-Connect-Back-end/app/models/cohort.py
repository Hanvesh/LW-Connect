"""Cohort model."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Boolean, Date
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base


class Cohort(Base):
    """Cohort model for group learning."""
    __tablename__ = "cohorts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(String(1000))
    start_date = Column(Date)
    end_date = Column(Date)
    max_participants = Column(Integer, default=30)
    is_active = Column(Boolean, default=True)
    extra_metadata = Column("metadata", JSONB, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    course = relationship("Course", back_populates="cohorts")
    enrollments = relationship("CohortEnrollment", back_populates="cohort", cascade="all, delete-orphan")


class CohortEnrollment(Base):
    """Cohort enrollment tracking."""
    __tablename__ = "cohort_enrollments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cohort_id = Column(UUID(as_uuid=True), ForeignKey("cohorts.id", ondelete="CASCADE"), nullable=False)
    learner_id = Column(UUID(as_uuid=True), ForeignKey("learners.id", ondelete="CASCADE"), nullable=False)
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    progress_percentage = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    cohort = relationship("Cohort", back_populates="enrollments")
    learner = relationship("Learner", back_populates="cohort_enrollments")
