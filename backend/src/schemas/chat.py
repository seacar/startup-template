"""Chat schemas."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class ChatBase(BaseModel):
    """Base chat schema."""
    title: str
    document_type: str


class ChatCreate(BaseModel):
    """Schema for creating a chat."""
    document_type: str


class Chat(ChatBase):
    """Chat schema."""
    id: UUID
    project_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ChatListItem(BaseModel):
    """Chat list item schema."""
    id: UUID
    project_id: UUID
    title: str
    document_type: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0
    latest_document_version: Optional[int] = None

    class Config:
        from_attributes = True


class ChatListResponse(BaseModel):
    """Response schema for listing chats."""
    chats: list[ChatListItem]
    total: int
    limit: int
    offset: int


class ChatCreateResponse(Chat):
    """Response schema for creating a chat."""
    suggested_questions: list[str] = []


class ChatDetail(Chat):
    """Chat detail schema with messages and document."""
    messages: list[dict] = []
    current_document: Optional[dict] = None

