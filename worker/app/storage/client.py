"""Supabase Storage client."""

from supabase import Client, create_client

from app.core.config import settings

_supabase_client: Client | None = None


def get_storage_client() -> Client:
    """Get Supabase storage client."""
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(
            settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY
        )
    return _supabase_client


def upload_file(storage_key: str, file_bytes: bytes, mime_type: str) -> None:
    """
    Upload file to Supabase Storage.

    Args:
        storage_key: Storage key/path
        file_bytes: File content as bytes
        mime_type: MIME type of the file
    """
    client = get_storage_client()
    client.storage.from_("generated-resumes").upload(
        storage_key, file_bytes, file_options={"content-type": mime_type}
    )

