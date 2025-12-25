"""Chat repository."""
from __future__ import annotations

from typing import Optional
from uuid import UUID

from src.services.supabase import get_supabase_admin_client


class ChatRepository:
    """Repository for chat operations."""

    @staticmethod
    def create(project_id: UUID, title: str, document_type: str) -> dict:
        """Create a new chat."""
        supabase = get_supabase_admin_client()
        data = {
            "project_id": str(project_id),
            "title": title,
            "document_type": document_type
        }
        
        result = supabase.table("chats").insert(data).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        raise Exception("Failed to create chat")

    @staticmethod
    def get_by_id(chat_id: UUID) -> Optional[dict]:
        """Get chat by ID."""
        supabase = get_supabase_admin_client()
        result = supabase.table("chats").select("*").eq("id", str(chat_id)).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        return None

    @staticmethod
    def list_by_project(project_id: UUID, limit: int = 50, offset: int = 0) -> tuple[list[dict], int]:
        """List chats for a project."""
        supabase = get_supabase_admin_client()
        
        # Get chats with message counts and latest document version
        result = supabase.table("chats").select(
            "id, project_id, title, document_type, created_at, updated_at, messages(count), documents(version)"
        ).eq("project_id", str(project_id)).order("updated_at", desc=True).range(offset, offset + limit - 1).execute()
        
        # Get total count
        count_result = supabase.table("chats").select("id", count="exact").eq("project_id", str(project_id)).execute()
        total = count_result.count if count_result.count else 0
        
        chats = []
        for chat in result.data:
            message_count = len(chat.get("messages", [])) if chat.get("messages") else 0
            documents = chat.get("documents", []) or []
            latest_version = max([d["version"] for d in documents], default=None) if documents else None
            
            chat_data = {
                "id": chat["id"],
                "project_id": chat["project_id"],
                "title": chat["title"],
                "document_type": chat["document_type"],
                "created_at": chat["created_at"],
                "updated_at": chat["updated_at"],
                "message_count": message_count,
                "latest_document_version": latest_version
            }
            chats.append(chat_data)
        
        return chats, total

    @staticmethod
    def delete(chat_id: UUID) -> None:
        """Delete chat (cascade deletes messages and documents)."""
        supabase = get_supabase_admin_client()
        supabase.table("chats").delete().eq("id", str(chat_id)).execute()

    @staticmethod
    def get_with_messages_and_document(chat_id: UUID) -> Optional[dict]:
        """Get chat with messages and current document."""
        supabase = get_supabase_admin_client()
        
        # Get chat with messages
        chat_result = supabase.table("chats").select("*").eq("id", str(chat_id)).execute()
        if not chat_result.data or len(chat_result.data) == 0:
            return None
        
        chat = chat_result.data[0]
        
        # Get messages
        messages_result = supabase.table("messages").select("*").eq("chat_id", str(chat_id)).order("created_at").execute()
        messages = messages_result.data if messages_result.data else []
        
        # Get latest document
        doc_result = supabase.table("documents").select("*").eq("chat_id", str(chat_id)).order("version", desc=True).limit(1).execute()
        current_document = doc_result.data[0] if doc_result.data and len(doc_result.data) > 0 else None
        
        return {
            **chat,
            "messages": messages,
            "current_document": current_document
        }

