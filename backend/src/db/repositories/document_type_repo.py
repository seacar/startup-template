"""Document type repository."""
from src.services.supabase import get_supabase_admin_client


class DocumentTypeRepository:
    """Repository for document type operations."""

    @staticmethod
    def list_active() -> list[dict]:
        """List all active document types."""
        supabase = get_supabase_admin_client()
        result = supabase.table("document_types").select("*").eq("is_active", True).order("name").execute()
        
        return result.data if result.data else []

    @staticmethod
    def get_by_name(name: str) -> dict | None:
        """Get document type by name."""
        supabase = get_supabase_admin_client()
        result = supabase.table("document_types").select("*").eq("name", name).eq("is_active", True).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        return None

    @staticmethod
    def create(data: dict) -> dict:
        """Create a new document type."""
        supabase = get_supabase_admin_client()
        result = supabase.table("document_types").insert(data).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        raise Exception("Failed to create document type")

