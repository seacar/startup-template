"""Supabase client service."""
from supabase import create_client, Client

from src.config import settings

_supabase_client: Client | None = None


def get_supabase_client() -> Client:
    """Get or create Supabase client."""
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_PUBLISHABLE_KEY)
    return _supabase_client


def get_supabase_admin_client() -> Client:
    """Get Supabase admin client with secret key."""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SECRET_KEY)

