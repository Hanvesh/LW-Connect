"""API endpoints for session management."""
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.session_service import SessionGeneratorService
from pydantic import BaseModel


router = APIRouter(prefix="/sessions", tags=["Sessions"])


class SessionResponse(BaseModel):
    """Session response model."""
    id: str
    mentor_name: str
    mentor_expertise: List[str]
    date: str
    time: str
    concept: str
    description: str
    meeting_link: str
    max_participants: int


@router.post("/generate")
async def generate_sessions(
    weeks: int = Query(4, description="Number of weeks to generate sessions for"),
    db: Session = Depends(get_db)
):
    """Generate sessions for all mentors."""
    service = SessionGeneratorService(db)
    sessions = service.generate_sessions_for_mentors(weeks)
    return {"message": f"Generated {len(sessions)} sessions", "sessions": sessions}


@router.get("/upcoming", response_model=List[SessionResponse])
async def get_upcoming_sessions(
    limit: int = Query(50, description="Number of sessions to retrieve"),
    db: Session = Depends(get_db)
):
    """Get upcoming sessions for learners."""
    service = SessionGeneratorService(db)
    return service.get_upcoming_sessions(limit)
