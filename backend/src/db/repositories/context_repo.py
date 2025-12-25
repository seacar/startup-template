"""Context item repository."""
from __future__ import annotations

from typing import Literal, Optional
from uuid import UUID

from src.services.supabase import get_supabase_admin_client


class ContextRepository:
    """Repository for context item operations."""

    @staticmethod
    def create(
        scope: Literal["global", "user", "project", "chat"],
        title: str,
        content: str,
        user_id: Optional[UUID] = None,
        project_id: Optional[UUID] = None,
        chat_id: Optional[UUID] = None,
        file_url: Optional[str] = None,
        file_type: Optional[str] = None
    ) -> dict:
        """Create a new context item."""
        supabase = get_supabase_admin_client()
        data = {
            "scope": scope,
            "title": title,
            "content": content
        }
        
        if user_id:
            data["user_id"] = str(user_id)
        if project_id:
            data["project_id"] = str(project_id)
        if chat_id:
            data["chat_id"] = str(chat_id)
        if file_url:
            data["file_url"] = file_url
        if file_type:
            data["file_type"] = file_type
        
        result = supabase.table("context_items").insert(data).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        raise Exception("Failed to create context item")

    @staticmethod
    def get_by_id(context_id: UUID) -> Optional[dict]:
        """Get context item by ID."""
        supabase = get_supabase_admin_client()
        result = supabase.table("context_items").select("*").eq("id", str(context_id)).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        return None

    @staticmethod
    def list(
        scope: Optional[Literal["global", "user", "project", "chat"]] = None,
        user_id: Optional[UUID] = None,
        project_id: Optional[UUID] = None,
        chat_id: Optional[UUID] = None,
        limit: int = 50,
        offset: int = 0
    ) -> tuple[list[dict], int]:
        """List context items with filters."""
        supabase = get_supabase_admin_client()
        query = supabase.table("context_items").select("id, scope, title, content, file_url, file_type, created_at")
        
        if scope:
            query = query.eq("scope", scope)
        if user_id:
            query = query.eq("user_id", str(user_id))
        if project_id:
            query = query.eq("project_id", str(project_id))
        if chat_id:
            query = query.eq("chat_id", str(chat_id))
        
        # Get total count
        count_query = supabase.table("context_items").select("id", count="exact")
        if scope:
            count_query = count_query.eq("scope", scope)
        if user_id:
            count_query = count_query.eq("user_id", str(user_id))
        if project_id:
            count_query = count_query.eq("project_id", str(project_id))
        if chat_id:
            count_query = count_query.eq("chat_id", str(chat_id))
        
        count_result = count_query.execute()
        total = count_result.count if count_result.count else 0
        
        # Get items with pagination
        result = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        items = []
        for item in (result.data or []):
            # Truncate content for preview
            content_preview = item["content"][:200] if len(item["content"]) > 200 else item["content"]
            item_data = {
                **item,
                "content_preview": content_preview
            }
            items.append(item_data)
        
        return items, total

    @staticmethod
    def delete(context_id: UUID) -> None:
        """Delete context item (cascade deletes embeddings)."""
        supabase = get_supabase_admin_client()
        supabase.table("context_items").delete().eq("id", str(context_id)).execute()

    @staticmethod
    def get_all_by_scope(
        scope: Literal["global", "user", "project", "chat"],
        user_id: Optional[UUID] = None,
        project_id: Optional[UUID] = None,
        chat_id: Optional[UUID] = None
    ) -> list[dict]:
        """Get all context items for a scope (no pagination, for context retrieval)."""
        supabase = get_supabase_admin_client()
        query = supabase.table("context_items").select("*").eq("scope", scope)
        
        if user_id:
            query = query.eq("user_id", str(user_id))
        if project_id:
            query = query.eq("project_id", str(project_id))
        if chat_id:
            query = query.eq("chat_id", str(chat_id))
        
        result = query.execute()
        return result.data if result.data else []

