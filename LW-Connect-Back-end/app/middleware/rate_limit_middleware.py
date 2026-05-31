"""Rate limiting middleware."""
from fastapi import Request, HTTPException
from datetime import datetime, timedelta
from collections import defaultdict
import asyncio

# Simple in-memory rate limiter (use Redis in production)
rate_limit_store = defaultdict(list)
RATE_LIMIT = 60  # requests per minute
CLEANUP_INTERVAL = 300  # cleanup every 5 minutes


def get_client_key(request: Request) -> str:
    """Get client identifier."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0]
    return request.client.host if request.client else "unknown"


async def rate_limit_middleware(request: Request, call_next):
    """Rate limiting middleware."""
    # Skip rate limiting for health checks
    if request.url.path in ["/health", "/"]:
        return await call_next(request)
    
    client_key = get_client_key(request)
    now = datetime.utcnow()
    minute_ago = now - timedelta(minutes=1)
    
    # Clean old entries
    rate_limit_store[client_key] = [
        ts for ts in rate_limit_store[client_key] if ts > minute_ago
    ]
    
    # Check rate limit
    if len(rate_limit_store[client_key]) >= RATE_LIMIT:
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later."
        )
    
    # Add current request
    rate_limit_store[client_key].append(now)
    
    response = await call_next(request)
    return response
