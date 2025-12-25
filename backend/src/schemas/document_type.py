"""Document type schemas."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class DocumentTypeBase(BaseModel):
    """Base document type schema."""
    name: str
    description: Optional[str] = None
    template_prompt: Optional[str] = None


class DocumentTypeCreate(BaseModel):
    """Schema for creating a document type."""
    name: str
    description: Optional[str] = None
    template_prompt: Optional[str] = None
    example_output: Optional[str] = None


class DocumentType(DocumentTypeBase):
    """Document type schema."""
    id: UUID
    example_output: Optional[str] = None
    is_active: bool = True
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentTypeListResponse(BaseModel):
    """Response schema for listing document types."""
    document_types: list[DocumentType]

