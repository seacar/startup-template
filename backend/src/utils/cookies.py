"""Cookie utility functions for user tracking."""
import uuid
from fastapi import Request, Response

from src.config import settings


def get_user_cookie(request: Request) -> str | None:
    """Extract user_cookie from request cookies."""
    return request.cookies.get("user_cookie")


def set_user_cookie(response: Response, cookie_id: str) -> None:
    """Set user_cookie in response headers."""
    response.set_cookie(
        key="user_cookie",
        value=cookie_id,
        domain=settings.COOKIE_DOMAIN if settings.COOKIE_DOMAIN else None,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        httponly=True,
        max_age=31536000,  # 1 year
    )


def generate_cookie_id() -> str:
    """Generate a new UUID cookie ID."""
    return str(uuid.uuid4())

