"""Document schemas."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class DocumentBase(BaseModel):
    """Base document schema."""
    version: int
    content: str
    token_input: int
    token_output: int


class DocumentCreate(BaseModel):
    """Schema for creating a document."""
    content: str
    token_input: int
    token_output: int
    diff_from_previous: Optional[str] = None
    generation_time_ms: Optional[int] = None


class Document(DocumentBase):
    """Document schema."""
    id: UUID
    chat_id: UUID
    diff_from_previous: Optional[str] = None
    generation_time_ms: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentListItem(BaseModel):
    """Document list item schema."""
    id: UUID
    version: int
    token_input: int
    token_output: int
    generation_time_ms: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    """Response schema for listing documents."""
    documents: list[DocumentListItem]
    total_versions: int

