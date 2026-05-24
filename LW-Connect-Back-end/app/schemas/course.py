"""Course schemas."""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class CourseBase(BaseModel):
    """Base course schema."""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    tags: Optional[List[str]] = []
    difficulty_level: Optional[str] = None
    duration_hours: Optional[int] = None
    prerequisites: Optional[List[str]] = []
    learning_outcomes: Optional[List[str]] = []
    content_url: Optional[str] = None
    thumbnail_url: Optional[str] = None


class CourseCreate(CourseBase):
    """Course creation schema."""
    is_published: bool = False


class CourseUpdate(BaseModel):
    """Course update schema."""
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    difficulty_level: Optional[str] = None
    duration_hours: Optional[int] = None
    is_published: Optional[bool] = None
    prerequisites: Optional[List[str]] = None
    learning_outcomes: Optional[List[str]] = None
    content_url: Optional[str] = None
    thumbnail_url: Optional[str] = None


class CourseResponse(CourseBase):
    """Course response schema."""
    id: UUID
    is_published: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
