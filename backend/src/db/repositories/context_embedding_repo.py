"""Context embedding repository for vector search."""
from typing import Optional
from uuid import UUID

from src.services.supabase import get_supabase_admin_client


class ContextEmbeddingRepository:
    """Repository for context embedding operations."""

    @staticmethod
    def create(
        context_item_id: UUID,
        chunk_index: int,
        content: str,
        embedding: list[float]
    ) -> dict:
        """Create a new context embedding."""
        supabase = get_supabase_admin_client()
        data = {
            "context_item_id": str(context_item_id),
            "chunk_index": chunk_index,
            "content": content,
            "embedding": embedding
        }
        
        result = supabase.table("context_embeddings").insert(data).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        raise Exception("Failed to create context embedding")

    @staticmethod
    def create_batch(embeddings: list[dict]) -> list[dict]:
        """Create multiple embeddings in batch."""
        supabase = get_supabase_admin_client()
        result = supabase.table("context_embeddings").insert(embeddings).execute()
        
        return result.data if result.data else []

    @staticmethod
    def vector_search(
        embedding: list[float],
        scope: Optional[str] = None,
        user_id: Optional[UUID] = None,
        limit: int = 10
    ) -> list[dict]:
        """
        Perform vector similarity search.
        
        Note: This uses Supabase's vector similarity search function.
        The actual implementation may vary based on Supabase version.
        """
        supabase = get_supabase_admin_client()
        
        # Build the query - using match_embeddings function if available
        # Otherwise, we'll need to use raw SQL via RPC
        # For now, using a simplified approach with direct SQL
        
        # Get context items first to filter by scope/user_id
        context_query = supabase.table("context_items").select("id")
        if scope:
            context_query = context_query.eq("scope", scope)
        if user_id:
            context_query = context_query.eq("user_id", str(user_id))
        
        context_result = context_query.execute()
        context_item_ids = [item["id"] for item in (context_result.data or [])]
        
        if not context_item_ids:
            return []
        
        # Use RPC call for vector similarity search
        # This assumes a function exists in the database
        # For now, return empty - this will be implemented with proper vector search
        # when the database function is available
        
        # Temporary: return embeddings for the context items
        result = supabase.table("context_embeddings").select(
            "*, context_items!inner(*)"
        ).in_("context_item_id", [str(cid) for cid in context_item_ids]).limit(limit).execute()
        
        return result.data if result.data else []

    @staticmethod
    def get_by_context_item(context_item_id: UUID) -> list[dict]:
        """Get all embeddings for a context item."""
        supabase = get_supabase_admin_client()
        result = supabase.table("context_embeddings").select("*").eq(
            "context_item_id", str(context_item_id)
        ).order("chunk_index").execute()
        
        return result.data if result.data else []

    @staticmethod
    def delete_by_context_item(context_item_id: UUID) -> None:
        """Delete all embeddings for a context item."""
        supabase = get_supabase_admin_client()
        supabase.table("context_embeddings").delete().eq("context_item_id", str(context_item_id)).execute()

