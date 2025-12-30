"""Database connection and session management."""

from typing import Generator

from supabase import Client, create_client

from app.core.config import settings

# Global Supabase client
_supabase_client: Client | None = None


def get_supabase_client() -> Client:
    """Get or create Supabase client."""
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(
            settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY
        )
    return _supabase_client


def get_supabase_anon_client() -> Client:
    """Get Supabase client with anon key (for client-side operations)."""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)

