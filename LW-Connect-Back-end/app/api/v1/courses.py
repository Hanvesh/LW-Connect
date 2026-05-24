"""Course routes."""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_role
from app.repositories.course_repository import CourseRepository
from app.schemas.course import CourseCreate, CourseUpdate, CourseResponse

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.post("", response_model=CourseResponse, status_code=201)
async def create_course(
    course_data: CourseCreate,
    current_user = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    """Create a new course."""
    course_repo = CourseRepository(db)
    course = await course_repo.create(course_data)
    return CourseResponse.model_validate(course)


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get course by ID."""
    course_repo = CourseRepository(db)
    course = await course_repo.get_by_id(course_id)
    if not course:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return CourseResponse.model_validate(course)


@router.put("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: UUID,
    course_data: CourseUpdate,
    current_user = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    """Update course."""
    course_repo = CourseRepository(db)
    course = await course_repo.update(course_id, course_data)
    if not course:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return CourseResponse.model_validate(course)


@router.delete("/{course_id}", status_code=204)
async def delete_course(
    course_id: UUID,
    current_user = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    """Delete course."""
    course_repo = CourseRepository(db)
    deleted = await course_repo.delete(course_id)
    if not deleted:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")


@router.get("", response_model=List[CourseResponse])
async def list_courses(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    published_only: bool = Query(False),
    db: AsyncSession = Depends(get_db)
):
    """List all courses."""
    course_repo = CourseRepository(db)
    courses = await course_repo.list_all(skip, limit, published_only)
    return [CourseResponse.model_validate(c) for c in courses]


@router.post("/search", response_model=List[CourseResponse])
async def search_courses(
    tags: List[str],
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Search courses by tags."""
    course_repo = CourseRepository(db)
    courses = await course_repo.search_by_tags(tags, skip, limit)
    return [CourseResponse.model_validate(c) for c in courses]
