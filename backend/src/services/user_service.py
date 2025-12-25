"""User service."""
from typing import Optional
from uuid import UUID

from src.db.repositories.user_repo import UserRepository
from src.schemas.user import User, UserCreate, UserUpdate, UserListResponse, UserListItem


class UserService:
    """Service for user operations."""

    @staticmethod
    def get_or_create(cookie_id: str) -> User:
        """Get or create user by cookie_id."""
        user_data = UserRepository.get_or_create(cookie_id)
        return User(**user_data)

    @staticmethod
    def get_by_id(user_id: UUID) -> Optional[User]:
        """Get user by ID."""
        user_data = UserRepository.get_by_id(user_id)
        if user_data:
            return User(**user_data)
        return None

    @staticmethod
    def list_all() -> UserListResponse:
        """List all users."""
        users_data = UserRepository.list_all()
        users = [UserListItem(**user) for user in users_data]
        return UserListResponse(users=users, total=len(users))

    @staticmethod
    def update(user_id: UUID, update_data: UserUpdate) -> User:
        """Update user."""
        user_data = UserRepository.update(user_id, update_data.name)
        return User(**user_data)

    @staticmethod
    def switch_user(user_id: UUID, cookie_id: str) -> User:
        """Switch to a different user (used when setting cookie)."""
        user_data = UserRepository.get_by_id(user_id)
        if not user_data:
            raise ValueError(f"User {user_id} not found")
        return User(**user_data)

