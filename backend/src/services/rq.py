"""RQ (Redis Queue) service for background job processing."""
from typing import Optional, Union

import redis
from rq import Queue
from upstash_redis import Redis as UpstashRedis

from src.config import settings


_rq_connection: Optional[Union[redis.Redis, UpstashRedis]] = None
_rq_queue: Optional[Queue] = None


def get_rq_connection() -> Union[redis.Redis, UpstashRedis]:
    """Get or create Redis connection for RQ.
    
    RQ works with both standard redis-py and upstash-redis clients.
    Upstash Redis can be accessed via:
    1. Standard redis-py with REDIS_URL (recommended for RQ)
    2. Upstash REST API with REDIS_REST_URL and REDIS_REST_TOKEN
    """
    global _rq_connection
    if _rq_connection is None:
        if settings.REDIS_URL:
            # Use standard redis-py with Upstash Redis connection string
            # This is the recommended approach for RQ
            _rq_connection = redis.from_url(
                settings.REDIS_URL,
                decode_responses=False,  # RQ expects bytes
            )
        elif settings.REDIS_REST_URL and settings.REDIS_REST_TOKEN:
            # Use Upstash Redis REST API client
            # Note: This may have limitations with RQ, prefer REDIS_URL if possible
            _rq_connection = UpstashRedis(
                url=settings.REDIS_REST_URL,
                token=settings.REDIS_REST_TOKEN,
            )
        else:
            raise ValueError(
                "Either REDIS_URL or (REDIS_REST_URL and REDIS_REST_TOKEN) must be set"
            )
    return _rq_connection


def get_rq_queue(name: str = "default") -> Queue:
    """Get or create RQ queue.
    
    Args:
        name: Queue name (default: "default")
        
    Returns:
        RQ Queue instance
    """
    connection = get_rq_connection()
    return Queue(name, connection=connection)


def enqueue_job(func, *args, queue_name: str = "default", **kwargs):
    """Enqueue a job to an RQ queue.
    
    Args:
        func: Function to execute as a background job
        *args: Positional arguments to pass to the function
        queue_name: Name of the queue to enqueue to (default: "default")
        **kwargs: Keyword arguments to pass to the function
        
    Returns:
        RQ Job instance
    """
    queue = get_rq_queue(queue_name)
    return queue.enqueue(func, *args, **kwargs)
