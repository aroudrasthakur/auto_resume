"""Worker configuration."""

import os
from pathlib import Path

try:
    from pydantic import field_validator
    from pydantic_settings import BaseSettings, SettingsConfigDict
except ImportError:
    from pydantic import BaseSettings
    from pydantic import ConfigDict as SettingsConfigDict
    from pydantic import field_validator


# Get project root (two levels up from worker/app/core/config.py)
_project_root = Path(__file__).parent.parent.parent.parent
_env_file = _project_root / ".env"


class Settings(BaseSettings):
    """Worker settings."""

    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str

    # AI Provider
    AI_PROVIDER: str = "openai"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"  # Faster than gpt-4o; use gpt-4o for higher quality
    OLLAMA_URL: str = "http://localhost:11434"

    # Embedding
    EMBEDDING_PROVIDER: str = "openai"
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    EMBEDDING_DIMENSION: int = 1536

    # LaTeX (optional: full path to pdflatex when not on PATH)
    PDFLATEX_PATH: str = ""

    # Storage: local fallback (disabled in production regardless of .env)
    STORAGE_LOCAL_ENABLED: bool = False
    STORAGE_LOCAL_DIR: str = ""
    ENVIRONMENT: str = "development"

    @field_validator("STORAGE_LOCAL_ENABLED", mode="before")
    @classmethod
    def parse_storage_local_enabled(cls, v):
        if v is None or v == "":
            return False
        if isinstance(v, bool):
            return v
        return str(v).lower() in ("true", "1", "yes")

    model_config = SettingsConfigDict(
        extra="ignore",  # Ignore extra fields from .env (used by backend/frontend)
        case_sensitive=True,
        env_file=str(_env_file) if _env_file.exists() else ".env",
        env_file_encoding="utf-8",
    )


settings = Settings()


def _use_local_storage() -> bool:
    """True only when local storage is enabled and not in production."""
    if settings.ENVIRONMENT == "production":
        return False
    if not settings.STORAGE_LOCAL_ENABLED:
        return False
    return bool((settings.STORAGE_LOCAL_DIR or "").strip())
