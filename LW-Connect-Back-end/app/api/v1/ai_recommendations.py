"""API endpoints for AI-powered mentor recommendations."""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.ai_service import AIService
from pydantic import BaseModel


router = APIRouter(prefix="/ai", tags=["AI Recommendations"])


class MentorRecommendationRequest(BaseModel):
    """Request model for mentor recommendations."""
    interests: List[str]
    goals: Optional[List[str]] = None
    availability_preference: Optional[str] = None
    limit: int = 3


class MentorRecommendationResponse(BaseModel):
    """Response model for mentor recommendations."""
    mentor_id: str
    name: str
    email: str
    specialization: str
    expertise: List[str]
    years_experience: int
    availability: str
    availability_slots: dict
    bio: str
    score: float
    match_reason: str


@router.post("/recommend-mentors", response_model=List[MentorRecommendationResponse])
async def recommend_mentors(
    request: MentorRecommendationRequest,
    db: Session = Depends(get_db)
):
    """Get AI-powered mentor recommendations with semantic search."""
    ai_service = AIService(db)
    recommendations = await ai_service.recommend_mentors(
        learner_interests=request.interests,
        learner_goals=request.goals,
        availability_preference=request.availability_preference,
        limit=request.limit
    )
    return recommendations


@router.get("/mentors/by-expertise")
async def get_mentors_by_expertise(
    expertise: str = Query(..., description="Expertise area to search for"),
    db: Session = Depends(get_db)
):
    """Find mentors by specific expertise area."""
    ai_service = AIService(db)
    mentors = ai_service.get_mentor_by_expertise(expertise)
    return {"expertise": expertise, "mentors": mentors}


@router.get("/mentors/by-availability")
async def get_mentors_by_availability(
    availability_type: str = Query(..., description="Availability type: weekdays_mornings, weekdays_afternoons, weekdays_evenings, weekends, flexible"),
    db: Session = Depends(get_db)
):
    """Get mentors available at specific times."""
    ai_service = AIService(db)
    mentors = ai_service.get_available_mentors_by_time(availability_type)
    return {"availability_type": availability_type, "mentors": mentors}
