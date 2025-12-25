"""Message schemas."""
from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel


class MessageBase(BaseModel):
    """Base message schema."""
    role: str
    content: str
    metadata: dict[str, Any] = {}


class MessageCreate(BaseModel):
    """Schema for creating a message."""
    role: str
    content: str
    metadata: Optional[dict[str, Any]] = None


class Message(MessageBase):
    """Message schema."""
    id: UUID
    chat_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

