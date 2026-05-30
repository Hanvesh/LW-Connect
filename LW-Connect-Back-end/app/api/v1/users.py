"""User management routes (admin only)."""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_role
from app.services.user_service import UserService
from app.schemas.user import AdminUserCreate, UserUpdate, UserResponse

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=List[UserResponse])
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user = Depends(require_role("admin", "mentor")),
    db: AsyncSession = Depends(get_db)
):
    """List all users."""
    user_service = UserService(db)
    return await user_service.list_users(skip, limit)


@router.post("", response_model=UserResponse, status_code=201)
async def create_user(
    user_data: AdminUserCreate,
    current_user = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    """Create a new user."""
    user_service = UserService(db)
    return await user_service.create_user(user_data)


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: UUID,
    user_data: UserUpdate,
    current_user = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db)
):
    """Update a user."""
    user_service = UserService(db)
    return await user_service.update_user(user_id, user_data)
