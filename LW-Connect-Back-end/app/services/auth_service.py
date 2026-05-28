"""Authentication service."""
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_password, get_password_hash, create_access_token
from app.repositories.user_repository import UserRepository
from app.repositories.learner_repository import LearnerRepository
from app.repositories.mentor_repository import MentorRepository
from app.schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.schemas.learner import LearnerCreate
from app.schemas.mentor import MentorCreate
from app.models.user import UserRole


class AuthService:
    """Service for authentication operations."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.learner_repo = LearnerRepository(db)
        self.mentor_repo = MentorRepository(db)
    
    async def signup(self, user_data: UserCreate) -> TokenResponse:
        """Register a new user."""
        if user_data.role == UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Admin accounts must be created by an existing administrator"
            )

        # Check if user already exists
        existing_user = await self.user_repo.get_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"This email is already registered as a {existing_user.role.value}. "
                    "Each email can only be used for one account type. Please sign in instead."
                )
            )
        
        # Create user
        hashed_password = get_password_hash(user_data.password)
        user = await self.user_repo.create(user_data, hashed_password)
        
        # Create profile based on role
        if user.role == UserRole.LEARNER:
            await self.learner_repo.create(user.id, LearnerCreate())
        elif user.role == UserRole.MENTOR:
            await self.mentor_repo.create(user.id, MentorCreate())
        
        # Generate token
        access_token = create_access_token({"sub": str(user.id)})
        
        return TokenResponse(
            access_token=access_token,
            user=UserResponse.model_validate(user)
        )
    
    async def login(self, login_data: UserLogin) -> TokenResponse:
        """Authenticate user and return token."""
        user = await self.user_repo.get_by_email(login_data.email)
        
        if not user or not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive"
            )
        
        access_token = create_access_token({"sub": str(user.id)})
        
        return TokenResponse(
            access_token=access_token,
            user=UserResponse.model_validate(user)
        )
