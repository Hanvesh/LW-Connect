from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum
from app.models.base import Base

class OutcomeType(str, enum.Enum):
    SKILL_ASSESSMENT = "skill_assessment"
    LEARNING_OUTCOME = "learning_outcome"
    CAREER_PROGRESSION = "career_progression"
    PROGRAM_COMPLETION = "program_completion"

class AssessmentType(str, enum.Enum):
    PRE_ASSESSMENT = "pre"
    POST_ASSESSMENT = "post"
    ONGOING = "ongoing"

class SkillAssessment(Base):
    __tablename__ = "skill_assessments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String(255), nullable=False)
    assessment_type = Column(SQLEnum(AssessmentType), nullable=False)
    score = Column(Float, nullable=False)  # 0-100
    assessment_date = Column(DateTime, default=datetime.utcnow)
    pathway_id = Column(UUID(as_uuid=True), ForeignKey("pathways.id", ondelete="SET NULL"))
    metadata = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="skill_assessments")
    pathway = relationship("Pathway")

class LearningOutcome(Base):
    __tablename__ = "learning_outcomes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    pathway_id = Column(UUID(as_uuid=True), ForeignKey("pathways.id", ondelete="CASCADE"))
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"))
    outcome_type = Column(SQLEnum(OutcomeType), nullable=False)
    metric_name = Column(String(255), nullable=False)
    baseline_value = Column(Float)
    current_value = Column(Float)
    target_value = Column(Float)
    improvement_percentage = Column(Float)
    achieved_at = Column(DateTime)
    metadata = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="learning_outcomes")
    pathway = relationship("Pathway")
    course = relationship("Course")

class CareerProgression(Base):
    __tablename__ = "career_progressions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(100), nullable=False)  # promotion, role_change, salary_increase
    previous_value = Column(String(255))
    new_value = Column(String(255))
    event_date = Column(DateTime, nullable=False)
    attributed_to_program = Column(String(255))
    metadata = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="career_progressions")

class ProgramMetrics(Base):
    __tablename__ = "program_metrics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cohort_id = Column(UUID(as_uuid=True), ForeignKey("cohorts.id", ondelete="CASCADE"))
    pathway_id = Column(UUID(as_uuid=True), ForeignKey("pathways.id", ondelete="CASCADE"))
    metric_name = Column(String(255), nullable=False)
    metric_value = Column(Float, nullable=False)
    calculation_date = Column(DateTime, default=datetime.utcnow)
    period_start = Column(DateTime)
    period_end = Column(DateTime)
    metadata = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    
    cohort = relationship("Cohort")
    pathway = relationship("Pathway")

class ROICalculation(Base):
    __tablename__ = "roi_calculations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cohort_id = Column(UUID(as_uuid=True), ForeignKey("cohorts.id", ondelete="CASCADE"))
    program_cost = Column(Float, nullable=False)
    productivity_gain = Column(Float, default=0)
    cost_savings = Column(Float, default=0)
    revenue_impact = Column(Float, default=0)
    total_benefit = Column(Float, nullable=False)
    roi_percentage = Column(Float, nullable=False)
    calculation_date = Column(DateTime, default=datetime.utcnow)
    metadata = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    
    cohort = relationship("Cohort")
