"""Common schemas."""
from pydantic import BaseModel
from typing import Generic, TypeVar, List, Optional

T = TypeVar('T')


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response schema."""
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int


class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
    detail: Optional[str] = None
