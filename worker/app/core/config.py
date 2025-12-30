"""Worker configuration."""

import os

try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings


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

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

