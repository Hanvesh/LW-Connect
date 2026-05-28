"""Booking model."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class BookingStatus(str, enum.Enum):
    """Booking status enumeration."""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class Booking(Base):
    """Booking model for mentor sessions."""
    __tablename__ = "bookings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    learner_id = Column(UUID(as_uuid=True), ForeignKey("learners.id", ondelete="CASCADE"), nullable=False)
    mentor_id = Column(UUID(as_uuid=True), ForeignKey("mentors.id", ondelete="CASCADE"), nullable=False)
    scheduled_at = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=60)
    status = Column(SQLEnum(BookingStatus, values_callable=lambda x: [e.value for e in x]), default=BookingStatus.PENDING)
    meeting_url = Column(String(500))
    notes = Column(Text)
    cancellation_reason = Column(Text)
    extra_metadata = Column("metadata", JSONB, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    learner = relationship("Learner", back_populates="bookings", foreign_keys=[learner_id])
    mentor = relationship("Mentor", back_populates="bookings", foreign_keys=[mentor_id])
    feedback = relationship("Feedback", back_populates="booking", uselist=False, cascade="all, delete-orphan")


class Feedback(Base):
    """Feedback model for completed sessions."""
    __tablename__ = "feedback"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="CASCADE"), unique=True, nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    booking = relationship("Booking", back_populates="feedback")
