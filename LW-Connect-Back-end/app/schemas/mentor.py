"""Mentor schemas."""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict
from datetime import datetime
from uuid import UUID


class MentorBase(BaseModel):
    """Base mentor schema."""
    bio: Optional[str] = None
    expertise: Optional[List[str]] = []
    skills: Optional[List[str]] = []
    years_of_experience: Optional[int] = None
    organization: Optional[str] = None
    job_title: Optional[str] = None
    is_available: bool = True
    max_mentees: int = 5
    hourly_rate: int = 0
    availability_schedule: Optional[Dict] = {}


class MentorCreate(MentorBase):
    """Mentor creation schema."""
    pass


class MentorUpdate(BaseModel):
    """Mentor update schema."""
    bio: Optional[str] = None
    expertise: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    years_of_experience: Optional[int] = None
    organization: Optional[str] = None
    job_title: Optional[str] = None
    is_available: Optional[bool] = None
    max_mentees: Optional[int] = None
    hourly_rate: Optional[int] = None
    availability_schedule: Optional[Dict] = None


class MentorResponse(MentorBase):
    """Mentor response schema."""
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class MentorSearchFilters(BaseModel):
    """Mentor search filters."""
    expertise: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    is_available: Optional[bool] = None
    min_experience: Optional[int] = None
    max_rate: Optional[int] = None
