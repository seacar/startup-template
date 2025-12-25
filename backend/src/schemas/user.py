"""User schemas."""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class UserBase(BaseModel):
    """Base user schema."""
    cookie_id: str
    name: Optional[str] = None


class UserCreate(UserBase):
    """Schema for creating a user."""
    pass


class UserUpdate(BaseModel):
    """Schema for updating a user."""
    name: Optional[str] = None


class User(UserBase):
    """User schema."""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserListItem(BaseModel):
    """User list item schema."""
    id: UUID
    cookie_id: str
    name: Optional[str] = None
    created_at: datetime
    project_count: int = 0

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    """Response schema for listing users."""
    users: list[UserListItem]
    total: int


class UserSwitchRequest(BaseModel):
    """Request schema for switching users."""
    user_id: UUID


class UserSwitchResponse(BaseModel):
    """Response schema for switching users."""
    id: UUID
    cookie_id: str
    name: Optional[str] = None
    message: str = "Switched to user successfully"

