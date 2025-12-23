"""Redis client service.

Supports both standard Redis (via redis-py) and Upstash Redis (via REST API).
When REDIS_REST_URL and REDIS_REST_TOKEN are provided, uses Upstash REST API
for seamless local/production switching via Serverless Redis HTTP (SRH).

This allows the same code to work with:
- Local development: SRH proxy -> local Redis
- Production: Upstash Redis REST API
"""
from typing import Any, Union

from upstash_redis.asyncio import Redis as AsyncUpstashRedis

from src.config import settings

_redis_client: Union[AsyncUpstashRedis, Any, None] = None


async def get_redis_client() -> Union[AsyncUpstashRedis, Any]:
    """Get or create Redis client.
    
    Uses Upstash REST API when REDIS_REST_URL and REDIS_REST_TOKEN are set.
    This allows seamless switching between local (via SRH) and production (Upstash).
    
    Returns:
        Redis client instance (AsyncUpstashRedis or redis.asyncio.Redis)
    """
    global _redis_client
    if _redis_client is None:
        if settings.REDIS_REST_URL and settings.REDIS_REST_TOKEN:
            # Use Upstash REST API (works with SRH locally and Upstash in production)
            _redis_client = AsyncUpstashRedis(
                url=settings.REDIS_REST_URL,
                token=settings.REDIS_REST_TOKEN,
            )
        elif settings.REDIS_URL:
            # Fallback to standard Redis connection string
            # Note: This won't work with Upstash REST API, prefer REDIS_REST_URL
            import redis.asyncio as redis
            _redis_client = await redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
            )
        else:
            raise ValueError(
                "Either REDIS_REST_URL/REDIS_REST_TOKEN or REDIS_URL must be set"
            )
    return _redis_client


async def close_redis_client():
    """Close Redis client connection."""
    global _redis_client
    if _redis_client:
        # Upstash async client doesn't need explicit close, but we'll handle it
        if hasattr(_redis_client, "close"):
            await _redis_client.close()
        _redis_client = None

