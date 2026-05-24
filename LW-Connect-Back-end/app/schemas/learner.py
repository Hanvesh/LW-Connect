"""Learner schemas."""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class LearnerBase(BaseModel):
    """Base learner schema."""
    bio: Optional[str] = None
    goals: Optional[List[str]] = []
    skills: Optional[List[str]] = []
    interests: Optional[List[str]] = []
    experience_level: Optional[str] = None
    organization: Optional[str] = None
    department: Optional[str] = None


class LearnerCreate(LearnerBase):
    """Learner creation schema."""
    pass


class LearnerUpdate(BaseModel):
    """Learner update schema."""
    bio: Optional[str] = None
    goals: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    experience_level: Optional[str] = None
    organization: Optional[str] = None
    department: Optional[str] = None


class LearnerResponse(LearnerBase):
    """Learner response schema."""
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
