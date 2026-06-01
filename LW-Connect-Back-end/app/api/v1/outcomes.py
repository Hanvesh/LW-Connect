from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import List
from uuid import UUID
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.outcome import (
    SkillAssessment, LearningOutcome, CareerProgression, 
    ProgramMetrics, ROICalculation, AssessmentType
)
from app.schemas.outcome import (
    SkillAssessmentCreate, SkillAssessmentResponse,
    LearningOutcomeCreate, LearningOutcomeResponse,
    OutcomesDashboard, ROICalculationCreate, ROICalculationResponse
)

router = APIRouter()

@router.post("/skill-assessments", response_model=SkillAssessmentResponse)
async def create_skill_assessment(
    assessment: SkillAssessmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    db_assessment = SkillAssessment(
        user_id=current_user.id,
        **assessment.dict()
    )
    db.add(db_assessment)
    await db.commit()
    await db.refresh(db_assessment)
    return db_assessment

@router.get("/skill-assessments", response_model=List[SkillAssessmentResponse])
async def get_skill_assessments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(SkillAssessment)
        .where(SkillAssessment.user_id == current_user.id)
        .order_by(SkillAssessment.assessment_date.desc())
    )
    return result.scalars().all()

@router.get("/skill-improvement/{skill_name}")
async def get_skill_improvement(
    skill_name: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(SkillAssessment)
        .where(
            and_(
                SkillAssessment.user_id == current_user.id,
                SkillAssessment.skill_name == skill_name
            )
        )
        .order_by(SkillAssessment.assessment_date)
    )
    assessments = result.scalars().all()
    
    if len(assessments) < 2:
        return {"improvement": 0, "assessments": len(assessments)}
    
    pre = next((a for a in assessments if a.assessment_type == AssessmentType.PRE_ASSESSMENT), None)
    post = assessments[-1]
    
    improvement = ((post.score - pre.score) / pre.score * 100) if pre else 0
    
    return {
        "skill_name": skill_name,
        "pre_score": pre.score if pre else None,
        "post_score": post.score,
        "improvement_percentage": round(improvement, 2),
        "assessments_count": len(assessments)
    }

@router.post("/learning-outcomes", response_model=LearningOutcomeResponse)
async def create_learning_outcome(
    outcome: LearningOutcomeCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    db_outcome = LearningOutcome(
        user_id=current_user.id,
        **outcome.dict()
    )
    db.add(db_outcome)
    await db.commit()
    await db.refresh(db_outcome)
    return db_outcome

@router.get("/dashboard", response_model=OutcomesDashboard)
async def get_outcomes_dashboard(
    cohort_id: UUID = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Total learners
    learners_result = await db.execute(
        select(func.count(User.id)).where(User.role == "learner")
    )
    total_learners = learners_result.scalar() or 0
    
    # Completion rate (sessions completed / total sessions)
    from app.models.session import Session
    sessions_result = await db.execute(
        select(
            func.count(Session.id).label("total"),
            func.sum(func.cast(Session.status == "completed", func.Integer)).label("completed")
        )
    )
    sessions_data = sessions_result.first()
    completion_rate = (sessions_data.completed / sessions_data.total * 100) if sessions_data.total else 0
    
    # Average skill improvement
    improvement_result = await db.execute(
        select(func.avg(LearningOutcome.improvement_percentage))
        .where(LearningOutcome.improvement_percentage.isnot(None))
    )
    avg_improvement = improvement_result.scalar() or 0
    
    # Career progressions
    career_result = await db.execute(
        select(func.count(CareerProgression.id))
    )
    career_count = career_result.scalar() or 0
    
    # ROI
    roi_result = await db.execute(
        select(func.avg(ROICalculation.roi_percentage))
    )
    avg_roi = roi_result.scalar() or 0
    
    # Top skills improved
    top_skills_result = await db.execute(
        select(
            SkillAssessment.skill_name,
            func.avg(LearningOutcome.improvement_percentage).label("avg_improvement")
        )
        .join(LearningOutcome, LearningOutcome.user_id == SkillAssessment.user_id)
        .group_by(SkillAssessment.skill_name)
        .order_by(func.avg(LearningOutcome.improvement_percentage).desc())
        .limit(5)
    )
    top_skills = [
        {"skill": row.skill_name, "improvement": round(row.avg_improvement or 0, 2)}
        for row in top_skills_result.all()
    ]
    
    return OutcomesDashboard(
        total_learners=total_learners,
        completion_rate=round(completion_rate, 2),
        average_skill_improvement=round(avg_improvement, 2),
        career_progressions=career_count,
        program_roi=round(avg_roi, 2),
        top_skills_improved=top_skills,
        outcomes_by_type={},
        recent_achievements=[]
    )

@router.post("/roi-calculation", response_model=ROICalculationResponse)
async def create_roi_calculation(
    roi: ROICalculationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_benefit = roi.productivity_gain + roi.cost_savings + roi.revenue_impact
    roi_percentage = ((total_benefit - roi.program_cost) / roi.program_cost * 100) if roi.program_cost > 0 else 0
    
    db_roi = ROICalculation(
        cohort_id=roi.cohort_id,
        program_cost=roi.program_cost,
        productivity_gain=roi.productivity_gain,
        cost_savings=roi.cost_savings,
        revenue_impact=roi.revenue_impact,
        total_benefit=total_benefit,
        roi_percentage=roi_percentage,
        metadata=roi.metadata
    )
    db.add(db_roi)
    await db.commit()
    await db.refresh(db_roi)
    return db_roi
