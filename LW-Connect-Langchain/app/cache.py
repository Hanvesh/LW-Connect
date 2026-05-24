import redis.asyncio as redis
from typing import Optional, Any
import json
from app.config import settings

class CacheService:
    def __init__(self):
        self.redis: Optional[redis.Redis] = None
    
    async def initialize(self):
        """Initialize Redis connection"""
        self.redis = await redis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True
        )
    
    async def get(self, key: str) -> Optional[Any]:
        """Get cached value"""
        value = await self.redis.get(key)
        if value:
            return json.loads(value)
        return None
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None):
        """Set cached value with TTL"""
        ttl = ttl or settings.cache_ttl
        await self.redis.setex(
            key,
            ttl,
            json.dumps(value)
        )
    
    async def delete(self, key: str):
        """Delete cached value"""
        await self.redis.delete(key)
    
    async def get_embedding(self, text: str) -> Optional[list]:
        """Get cached embedding"""
        key = f"embedding:{hash(text)}"
        return await self.get(key)
    
    async def set_embedding(self, text: str, embedding: list):
        """Cache embedding"""
        key = f"embedding:{hash(text)}"
        await self.set(key, embedding, ttl=86400)  # 24 hours
    
    async def get_query_result(self, query: str, filters: dict) -> Optional[dict]:
        """Get cached query result"""
        key = f"query:{hash(query)}:{hash(json.dumps(filters, sort_keys=True))}"
        return await self.get(key)
    
    async def set_query_result(self, query: str, filters: dict, result: dict):
        """Cache query result"""
        key = f"query:{hash(query)}:{hash(json.dumps(filters, sort_keys=True))}"
        await self.set(key, result, ttl=1800)  # 30 minutes
    
    async def close(self):
        """Close Redis connection"""
        if self.redis:
            await self.redis.close()

cache_service = CacheService()
