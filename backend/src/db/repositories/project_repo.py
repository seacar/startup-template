"""Project repository."""
from __future__ import annotations

from typing import Optional
from uuid import UUID

from src.services.supabase import get_supabase_admin_client


class ProjectRepository:
    """Repository for project operations."""

    @staticmethod
    def create(user_id: UUID, name: str, description: Optional[str] = None) -> dict:
        """Create a new project."""
        supabase = get_supabase_admin_client()
        data = {
            "user_id": str(user_id),
            "name": name
        }
        if description:
            data["description"] = description
        
        result = supabase.table("projects").insert(data).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        raise Exception("Failed to create project")

    @staticmethod
    def get_by_id(project_id: UUID) -> Optional[dict]:
        """Get project by ID."""
        supabase = get_supabase_admin_client()
        result = supabase.table("projects").select("*").eq("id", str(project_id)).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        return None

    @staticmethod
    def list_by_user(user_id: UUID, limit: int = 50, offset: int = 0) -> tuple[list[dict], int]:
        """List projects for a user."""
        supabase = get_supabase_admin_client()
        
        # Get projects with chat counts
        result = supabase.table("projects").select(
            "id, user_id, name, description, created_at, updated_at, chats(count)"
        ).eq("user_id", str(user_id)).order("updated_at", desc=True).range(offset, offset + limit - 1).execute()
        
        # Get total count
        count_result = supabase.table("projects").select("id", count="exact").eq("user_id", str(user_id)).execute()
        total = count_result.count if count_result.count else 0
        
        projects = []
        for project in result.data:
            chat_count = len(project.get("chats", [])) if project.get("chats") else 0
            project_data = {
                "id": project["id"],
                "user_id": project["user_id"],
                "name": project["name"],
                "description": project.get("description"),
                "created_at": project["created_at"],
                "updated_at": project["updated_at"],
                "chat_count": chat_count
            }
            projects.append(project_data)
        
        return projects, total

    @staticmethod
    def update(project_id: UUID, name: Optional[str] = None, description: Optional[str] = None) -> dict:
        """Update project."""
        supabase = get_supabase_admin_client()
        data = {}
        if name is not None:
            data["name"] = name
        if description is not None:
            data["description"] = description
        
        result = supabase.table("projects").update(data).eq("id", str(project_id)).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        raise Exception("Failed to update project")

    @staticmethod
    def delete(project_id: UUID) -> None:
        """Delete project (cascade deletes chats)."""
        supabase = get_supabase_admin_client()
        supabase.table("projects").delete().eq("id", str(project_id)).execute()

    @staticmethod
    def get_with_counts(project_id: UUID) -> Optional[dict]:
        """Get project with chat and context counts."""
        supabase = get_supabase_admin_client()
        
        # Get project with counts
        result = supabase.table("projects").select(
            "*, chats(count), context_items!project_id(count)"
        ).eq("id", str(project_id)).execute()
        
        if result.data and len(result.data) > 0:
            project = result.data[0]
            chat_count = len(project.get("chats", [])) if project.get("chats") else 0
            context_count = len(project.get("context_items", [])) if project.get("context_items") else 0
            
            return {
                **project,
                "chat_count": chat_count,
                "context_count": context_count
            }
        return None

