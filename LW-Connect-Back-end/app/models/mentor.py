"""Mentor model."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, ARRAY, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base


class Mentor(Base):
    """Mentor profile model."""
    __tablename__ = "mentors"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    bio = Column(Text)
    expertise = Column(ARRAY(String))  # Areas of expertise
    skills = Column(ARRAY(String))  # Skills they can teach
    years_of_experience = Column(Integer)
    organization = Column(String(255))
    job_title = Column(String(255))
    is_available = Column(Boolean, default=True)
    max_mentees = Column(Integer, default=5)
    hourly_rate = Column(Integer, default=0)  # 0 for free mentorship
    availability_schedule = Column(JSONB, default={})  # Weekly availability
    metadata = Column(JSONB, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="mentor_profile")
    bookings = relationship("Booking", back_populates="mentor", foreign_keys="Booking.mentor_id")
