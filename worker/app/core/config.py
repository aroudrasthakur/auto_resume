"""Worker configuration."""

import os
from pathlib import Path

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
except ImportError:
    from pydantic import BaseSettings
    from pydantic import ConfigDict as SettingsConfigDict


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
    OLLAMA_URL: str = "http://localhost:11434"

    # Embedding
    EMBEDDING_PROVIDER: str = "openai"
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    EMBEDDING_DIMENSION: int = 1536

    model_config = SettingsConfigDict(
        extra="ignore",  # Ignore extra fields from .env (used by backend/frontend)
        case_sensitive=True,
        env_file=str(_env_file) if _env_file.exists() else ".env",
        env_file_encoding="utf-8",
    )


settings = Settings()

