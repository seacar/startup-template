"""Document repository."""
from typing import Optional
from uuid import UUID

from src.services.supabase import get_supabase_admin_client


class DocumentRepository:
    """Repository for document operations."""

    @staticmethod
    def create(
        chat_id: UUID,
        content: str,
        token_input: int,
        token_output: int,
        diff_from_previous: Optional[str] = None,
        generation_time_ms: Optional[int] = None
    ) -> dict:
        """Create a new document version."""
        supabase = get_supabase_admin_client()
        
        # Get next version number
        latest = DocumentRepository.get_latest(chat_id)
        version = (latest["version"] + 1) if latest else 1
        
        data = {
            "chat_id": str(chat_id),
            "version": version,
            "content": content,
            "token_input": token_input,
            "token_output": token_output
        }
        
        if diff_from_previous:
            data["diff_from_previous"] = diff_from_previous
        if generation_time_ms:
            data["generation_time_ms"] = generation_time_ms
        
        result = supabase.table("documents").insert(data).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        raise Exception("Failed to create document")

    @staticmethod
    def get_by_id(document_id: UUID) -> Optional[dict]:
        """Get document by ID."""
        supabase = get_supabase_admin_client()
        result = supabase.table("documents").select("*").eq("id", str(document_id)).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        return None

    @staticmethod
    def get_latest(chat_id: UUID) -> Optional[dict]:
        """Get latest document version for a chat."""
        supabase = get_supabase_admin_client()
        result = supabase.table("documents").select("*").eq("chat_id", str(chat_id)).order("version", desc=True).limit(1).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        return None

    @staticmethod
    def list_by_chat(chat_id: UUID) -> list[dict]:
        """List all document versions for a chat."""
        supabase = get_supabase_admin_client()
        result = supabase.table("documents").select(
            "id, version, token_input, token_output, generation_time_ms, created_at"
        ).eq("chat_id", str(chat_id)).order("version", desc=True).execute()
        
        return result.data if result.data else []

