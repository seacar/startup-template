"""Generation metrics API routes."""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from src.dependencies.auth import CurrentUser
from src.schemas.metrics import ChatMetricsResponse
from src.services.metrics_service import MetricsService

router = APIRouter(prefix="/chats/{chat_id}/metrics", tags=["Metrics"])


@router.get("", response_model=ChatMetricsResponse)
async def get_chat_metrics(
    chat_id: UUID,
    current_user: CurrentUser,
):
    """Get generation metrics for a chat."""
    try:
        return MetricsService.get_by_chat(chat_id, UUID(current_user["id"]))
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

