"""Pathway schemas."""
from pydantic import BaseModel
from typing import Optional, List


class PathwayBase(BaseModel):
    """Base pathway schema."""
    title: str
    description: Optional[str] = None
    duration_weeks: Optional[int] = None
    difficulty: Optional[str] = None


class PathwayCreate(PathwayBase):
    """Create pathway schema."""
    course_ids: List[int] = []


class PathwayResponse(PathwayBase):
    """Pathway response schema."""
    id: int
    
    class Config:
        from_attributes = True


class PathwayWithCourses(PathwayResponse):
    """Pathway with courses."""
    courses: List[dict] = []
