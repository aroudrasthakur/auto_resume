"""Supabase Storage client with optional local fallback."""

from pathlib import Path

from supabase import Client, create_client

from app.core.config import _use_local_storage, settings

_supabase_client: Client | None = None
_project_root = Path(__file__).resolve().parents[3]  # worker/app/storage -> project root


def get_storage_client() -> Client:
    """Get Supabase storage client."""
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    return _supabase_client


def upload_file(storage_key: str, file_bytes: bytes, mime_type: str) -> None:
    """
    Upload file to Supabase Storage or local dir when STORAGE_LOCAL_ENABLED and not production.

    Args:
        storage_key: Storage key/path (e.g. user_id/resume_id/resume.pdf)
        file_bytes: File content as bytes
        mime_type: MIME type of the file
    """
    if not _use_local_storage():
        client = get_storage_client()
        client.storage.from_("generated-resumes").upload(
            storage_key, file_bytes, file_options={"content-type": mime_type}
        )
        return
    local_dir = (settings.STORAGE_LOCAL_DIR or "").strip()
    if local_dir:
        base = Path(local_dir)
        if not base.is_absolute():
            base = _project_root / base
        path = base / Path(*storage_key.split("/"))
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(file_bytes)
