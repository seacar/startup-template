"""Health check endpoints."""
from datetime import datetime

from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/ready")
async def readiness_check():
    """Readiness check endpoint."""
    # Add database, Redis, and other dependency checks here
    return {
        "status": "ready",
        "timestamp": datetime.utcnow().isoformat(),
    }

