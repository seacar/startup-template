"""Message repository."""
from typing import Any, Optional
from uuid import UUID

from src.services.supabase import get_supabase_admin_client


class MessageRepository:
    """Repository for message operations."""

    @staticmethod
    def create(
        chat_id: UUID,
        role: str,
        content: str,
        metadata: Optional[dict[str, Any]] = None
    ) -> dict:
        """Create a new message."""
        supabase = get_supabase_admin_client()
        data = {
            "chat_id": str(chat_id),
            "role": role,
            "content": content,
            "metadata": metadata or {}
        }
        
        result = supabase.table("messages").insert(data).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        raise Exception("Failed to create message")

    @staticmethod
    def get_by_id(message_id: UUID) -> Optional[dict]:
        """Get message by ID."""
        supabase = get_supabase_admin_client()
        result = supabase.table("messages").select("*").eq("id", str(message_id)).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        return None

    @staticmethod
    def list_by_chat(chat_id: UUID, limit: Optional[int] = None) -> list[dict]:
        """List messages for a chat."""
        supabase = get_supabase_admin_client()
        query = supabase.table("messages").select("*").eq("chat_id", str(chat_id)).order("created_at")
        
        if limit:
            query = query.limit(limit)
        
        result = query.execute()
        return result.data if result.data else []

