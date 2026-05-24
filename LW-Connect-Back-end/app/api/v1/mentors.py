"""Mentor routes."""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.services.mentor_service import MentorService
from app.schemas.mentor import MentorCreate, MentorUpdate, MentorResponse, MentorSearchFilters

router = APIRouter(prefix="/mentors", tags=["Mentors"])


@router.post("", response_model=MentorResponse, status_code=201)
async def create_mentor_profile(
    mentor_data: MentorCreate,
    current_user = Depends(require_role("mentor", "admin")),
    db: AsyncSession = Depends(get_db)
):
    """Create mentor profile."""
    mentor_service = MentorService(db)
    return await mentor_service.create_profile(current_user.id, mentor_data)


@router.get("/{mentor_id}", response_model=MentorResponse)
async def get_mentor(
    mentor_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get mentor profile by ID."""
    mentor_service = MentorService(db)
    return await mentor_service.get_profile(mentor_id)


@router.put("/{mentor_id}", response_model=MentorResponse)
async def update_mentor_profile(
    mentor_id: UUID,
    mentor_data: MentorUpdate,
    current_user = Depends(require_role("mentor", "admin")),
    db: AsyncSession = Depends(get_db)
):
    """Update mentor profile."""
    mentor_service = MentorService(db)
    return await mentor_service.update_profile(mentor_id, mentor_data)


@router.get("", response_model=List[MentorResponse])
async def list_mentors(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """List all mentors."""
    mentor_service = MentorService(db)
    return await mentor_service.list_mentors(skip, limit)


@router.post("/search", response_model=List[MentorResponse])
async def search_mentors(
    filters: MentorSearchFilters,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Search mentors with filters."""
    mentor_service = MentorService(db)
    return await mentor_service.search_mentors(filters, skip, limit)
