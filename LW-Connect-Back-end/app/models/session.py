"""Session model for scheduled mentor sessions."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, Date, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base


class Session(Base):
    """Scheduled mentor session model."""
    __tablename__ = "sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mentor_id = Column(UUID(as_uuid=True), ForeignKey("mentors.user_id", ondelete="CASCADE"), nullable=False)
    session_date = Column(Date, nullable=False)
    start_time = Column(String(10), nullable=False)
    end_time = Column(String(10), nullable=False)
    meeting_link = Column(String(500), nullable=False)
    concept = Column(String(255), nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    max_participants = Column(Integer, default=30)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    mentor = relationship("Mentor", foreign_keys=[mentor_id])
