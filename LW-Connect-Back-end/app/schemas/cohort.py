"""Cohort schemas."""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime, date
from uuid import UUID


class CohortBase(BaseModel):
    """Base cohort schema."""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    max_participants: int = 30
    is_active: bool = True


class CohortCreate(CohortBase):
    """Cohort creation schema."""
    course_id: UUID


class CohortUpdate(BaseModel):
    """Cohort update schema."""
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    max_participants: Optional[int] = None
    is_active: Optional[bool] = None


class CohortResponse(CohortBase):
    """Cohort response schema."""
    id: UUID
    course_id: UUID
    course_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    learner_count: int = 0
    completion_rate: float = 0.0
    spots_remaining: Optional[int] = None
    is_enrolled: Optional[bool] = None
    
    model_config = ConfigDict(from_attributes=True)


class LearnerCohortEnrollmentResponse(BaseModel):
    """Learner enrollment with cohort details."""
    id: UUID
    cohort_id: UUID
    learner_id: UUID
    enrolled_at: datetime
    completed_at: Optional[datetime] = None
    progress_percentage: int
    is_active: bool
    cohort: CohortResponse

    model_config = ConfigDict(from_attributes=True)


class CohortEnrollmentCreate(BaseModel):
    """Cohort enrollment creation schema."""
    cohort_id: UUID
    learner_id: UUID


class CohortEnrollmentResponse(BaseModel):
    """Cohort enrollment response schema."""
    id: UUID
    cohort_id: UUID
    learner_id: UUID
    enrolled_at: datetime
    completed_at: Optional[datetime] = None
    progress_percentage: int
    is_active: bool
    
    model_config = ConfigDict(from_attributes=True)
