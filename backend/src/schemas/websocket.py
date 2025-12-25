"""WebSocket message schemas."""
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel


class WebSocketMessageRequest(BaseModel):
    """WebSocket message request from client."""
    type: Literal["message"]
    content: str
    selected_response_id: Optional[UUID] = None
    regenerate: bool = False


class WebSocketTokenEvent(BaseModel):
    """Token streaming event."""
    type: Literal["token"] = "token"
    token: str
    content_type: Literal["content"] = "content"


class WebSocketFollowUpEvent(BaseModel):
    """Follow-up question event."""
    type: Literal["follow_up"] = "follow_up"
    question: str
    suggested_responses: list[str]
    id: UUID


class WebSocketMetricsEvent(BaseModel):
    """Metrics event."""
    type: Literal["metrics"] = "metrics"
    input_tokens: int
    output_tokens: int
    latency_ms: int


class WebSocketCompleteEvent(BaseModel):
    """Generation complete event."""
    type: Literal["complete"] = "complete"
    document_id: UUID
    version: int
    message_id: UUID


class WebSocketErrorEvent(BaseModel):
    """Error event."""
    type: Literal["error"] = "error"
    error: str

