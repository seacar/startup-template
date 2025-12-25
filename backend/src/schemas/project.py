"""Project schemas."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class ProjectBase(BaseModel):
    """Base project schema."""
    name: str
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    """Schema for creating a project."""
    pass


class ProjectUpdate(BaseModel):
    """Schema for updating a project."""
    name: Optional[str] = None
    description: Optional[str] = None


class Project(ProjectBase):
    """Project schema."""
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectListItem(BaseModel):
    """Project list item schema."""
    id: UUID
    user_id: UUID
    name: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    chat_count: int = 0

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    """Response schema for listing projects."""
    projects: list[ProjectListItem]
    total: int
    limit: int
    offset: int


class ProjectDetail(Project):
    """Project detail schema with counts."""
    chat_count: int = 0
    context_count: int = 0

