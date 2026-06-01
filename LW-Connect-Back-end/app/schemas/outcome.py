from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum

class OutcomeType(str, Enum):
    SKILL_ASSESSMENT = "skill_assessment"
    LEARNING_OUTCOME = "learning_outcome"
    CAREER_PROGRESSION = "career_progression"
    PROGRAM_COMPLETION = "program_completion"

class AssessmentType(str, Enum):
    PRE = "pre"
    POST = "post"
    ONGOING = "ongoing"

class SkillAssessmentCreate(BaseModel):
    skill_name: str
    assessment_type: AssessmentType
    score: float = Field(ge=0, le=100)
    pathway_id: Optional[UUID] = None
    metadata: dict = {}

class SkillAssessmentResponse(BaseModel):
    id: UUID
    user_id: UUID
    skill_name: str
    assessment_type: AssessmentType
    score: float
    assessment_date: datetime
    pathway_id: Optional[UUID]
    improvement: Optional[float] = None
    
    class Config:
        from_attributes = True

class LearningOutcomeCreate(BaseModel):
    pathway_id: Optional[UUID] = None
    course_id: Optional[UUID] = None
    outcome_type: OutcomeType
    metric_name: str
    baseline_value: Optional[float] = None
    target_value: Optional[float] = None
    metadata: dict = {}

class LearningOutcomeResponse(BaseModel):
    id: UUID
    user_id: UUID
    outcome_type: OutcomeType
    metric_name: str
    baseline_value: Optional[float]
    current_value: Optional[float]
    target_value: Optional[float]
    improvement_percentage: Optional[float]
    achieved_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class OutcomesDashboard(BaseModel):
    total_learners: int
    completion_rate: float
    average_skill_improvement: float
    career_progressions: int
    program_roi: float
    top_skills_improved: List[dict]
    outcomes_by_type: dict
    recent_achievements: List[dict]

class ROICalculationCreate(BaseModel):
    cohort_id: UUID
    program_cost: float
    productivity_gain: float = 0
    cost_savings: float = 0
    revenue_impact: float = 0
    metadata: dict = {}

class ROICalculationResponse(BaseModel):
    id: UUID
    cohort_id: UUID
    program_cost: float
    total_benefit: float
    roi_percentage: float
    calculation_date: datetime
    
    class Config:
        from_attributes = True
