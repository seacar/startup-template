"""Context item schemas."""
from datetime import datetime
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ContextItemBase(BaseModel):
    """Base context item schema."""
    scope: Literal["global", "user", "project", "chat"]
    title: str
    content: str


class ContextItemCreate(BaseModel):
    """Schema for creating a context item."""
    scope: Literal["global", "user", "project", "chat"]
    project_id: Optional[UUID] = None
    chat_id: Optional[UUID] = None
    title: str
    content: Optional[str] = None
    file_url: Optional[str] = None
    file_type: Optional[str] = None


class ContextItem(ContextItemBase):
    """Context item schema."""
    id: UUID
    user_id: Optional[UUID] = None
    project_id: Optional[UUID] = None
    chat_id: Optional[UUID] = None
    file_url: Optional[str] = None
    file_type: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ContextItemListItem(BaseModel):
    """Context item list item schema."""
    id: UUID
    scope: Literal["global", "user", "project", "chat"]
    title: str
    content_preview: str
    file_url: Optional[str] = None
    file_type: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ContextItemListResponse(BaseModel):
    """Response schema for listing context items."""
    context_items: list[ContextItemListItem]
    total: int
    limit: int
    offset: int


class ContextItemCreateResponse(ContextItem):
    """Response schema for creating a context item."""
    chunks_created: int = 0
    embeddings_created: int = 0

