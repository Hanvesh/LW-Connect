"""Booking schemas."""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID

from app.models.booking import BookingStatus


class BookingBase(BaseModel):
    """Base booking schema."""
    scheduled_at: datetime
    duration_minutes: int = 60
    notes: Optional[str] = None


class BookingCreate(BookingBase):
    """Booking creation schema."""
    mentor_id: UUID


class BookingUpdate(BaseModel):
    """Booking update schema."""
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    status: Optional[BookingStatus] = None
    meeting_url: Optional[str] = None
    notes: Optional[str] = None
    cancellation_reason: Optional[str] = None


class BookingResponse(BookingBase):
    """Booking response schema."""
    id: UUID
    learner_id: UUID
    mentor_id: UUID
    status: BookingStatus
    meeting_url: Optional[str] = None
    cancellation_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class FeedbackCreate(BaseModel):
    """Feedback creation schema."""
    booking_id: UUID
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class FeedbackResponse(BaseModel):
    """Feedback response schema."""
    id: UUID
    booking_id: UUID
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
