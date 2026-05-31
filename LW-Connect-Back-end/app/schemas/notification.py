"""Notification schemas."""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class NotificationBase(BaseModel):
    """Base notification schema."""
    title: str
    message: str
    type: str


class NotificationCreate(NotificationBase):
    """Create notification schema."""
    user_id: int


class NotificationResponse(NotificationBase):
    """Notification response schema."""
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class NotificationUpdate(BaseModel):
    """Update notification schema."""
    is_read: Optional[bool] = None
