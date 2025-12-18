"""Redis client service."""
import redis.asyncio as redis
from redis.asyncio import Redis

from src.config import settings

_redis_client: Redis | None = None


async def get_redis_client() -> Redis:
    """Get or create Redis client."""
    global _redis_client
    if _redis_client is None:
        _redis_client = await redis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
        )
    return _redis_client


async def close_redis_client():
    """Close Redis client connection."""
    global _redis_client
    if _redis_client:
        await _redis_client.close()
        _redis_client = None

