"""User repository."""
from typing import Optional
from uuid import UUID

from src.services.supabase import get_supabase_admin_client


class UserRepository:
    """Repository for user operations."""

    @staticmethod
    def get_by_cookie_id(cookie_id: str) -> Optional[dict]:
        """Get user by cookie_id."""
        supabase = get_supabase_admin_client()
        result = supabase.table("users").select("*").eq("cookie_id", cookie_id).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        return None

    @staticmethod
    def create(cookie_id: str, name: Optional[str] = None) -> dict:
        """Create a new user."""
        supabase = get_supabase_admin_client()
        data = {"cookie_id": cookie_id}
        if name:
            data["name"] = name
        
        result = supabase.table("users").insert(data).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        raise Exception("Failed to create user")

    @staticmethod
    def get_or_create(cookie_id: str, name: Optional[str] = None) -> dict:
        """Get existing user or create new one."""
        user = UserRepository.get_by_cookie_id(cookie_id)
        if user:
            return user
        return UserRepository.create(cookie_id, name)

    @staticmethod
    def update(user_id: UUID, name: Optional[str] = None) -> dict:
        """Update user."""
        supabase = get_supabase_admin_client()
        data = {}
        if name is not None:
            data["name"] = name
        
        result = supabase.table("users").update(data).eq("id", str(user_id)).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        raise Exception("Failed to update user")

    @staticmethod
    def list_all() -> list[dict]:
        """List all users with project counts."""
        supabase = get_supabase_admin_client()
        
        # Get users with project counts
        result = supabase.table("users").select(
            "id, cookie_id, name, created_at, projects(count)"
        ).execute()
        
        users = []
        for user in result.data:
            project_count = len(user.get("projects", [])) if user.get("projects") else 0
            user_data = {
                "id": user["id"],
                "cookie_id": user["cookie_id"],
                "name": user.get("name"),
                "created_at": user["created_at"],
                "project_count": project_count
            }
            users.append(user_data)
        
        return users

    @staticmethod
    def get_by_id(user_id: UUID) -> Optional[dict]:
        """Get user by ID."""
        supabase = get_supabase_admin_client()
        result = supabase.table("users").select("*").eq("id", str(user_id)).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        return None

