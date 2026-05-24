"""Learner model."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base


class Learner(Base):
    """Learner profile model."""
    __tablename__ = "learners"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    bio = Column(Text)
    goals = Column(ARRAY(String))  # Learning goals
    skills = Column(ARRAY(String))  # Current skills
    interests = Column(ARRAY(String))  # Areas of interest
    experience_level = Column(String(50))  # beginner, intermediate, advanced
    organization = Column(String(255))
    department = Column(String(255))
    metadata = Column(JSONB, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="learner_profile")
    bookings = relationship("Booking", back_populates="learner", foreign_keys="Booking.learner_id")
    cohort_enrollments = relationship("CohortEnrollment", back_populates="learner")
