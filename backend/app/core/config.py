"""Application configuration."""

import os
from pathlib import Path
from typing import List

from dotenv import load_dotenv

# Project root and .env path (backend/app/core/config.py -> 4 levels up)
_project_root = Path(__file__).resolve().parent.parent.parent.parent
_env_file = _project_root / ".env"

# Load .env into os.environ so shared modules (e.g. encryption) can use os.getenv
load_dotenv(_env_file)

try:
    from pydantic import field_validator
    from pydantic_settings import BaseSettings, SettingsConfigDict
except ImportError:
    from pydantic import BaseSettings
    from pydantic import ConfigDict as SettingsConfigDict
    from pydantic import field_validator


class Settings(BaseSettings):
    """Application settings."""

    # Supabase
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_KEY: str
    DATABASE_URL: str

    # Auth
    COGNITO_USER_POOL_ID: str = ""
    COGNITO_CLIENT_ID: str = ""
    COGNITO_CLIENT_SECRET: str = ""  # Required when app client has a secret
    COGNITO_REGION: str = "us-east-1"
    COGNITO_JWKS_URL: str = ""
    DEV_AUTH_BYPASS: bool = False

    @field_validator("DEV_AUTH_BYPASS", mode="before")
    @classmethod
    def parse_dev_auth_bypass(cls, v):
        if v is None or v == "":
            return False
        if isinstance(v, bool):
            return v
        return str(v).lower() in ("true", "1", "yes")

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    ENVIRONMENT: str = "development"

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 100
    RATE_LIMIT_GENERATE_PER_HOUR: int = 10

    # Storage: local fallback (disabled in production regardless of .env)
    STORAGE_LOCAL_ENABLED: bool = False
    STORAGE_LOCAL_DIR: str = ""

    @field_validator("STORAGE_LOCAL_ENABLED", mode="before")
    @classmethod
    def parse_storage_local_enabled(cls, v):
        if v is None or v == "":
            return False
        if isinstance(v, bool):
            return v
        return str(v).lower() in ("true", "1", "yes")

    model_config = SettingsConfigDict(
        extra="ignore",  # Ignore extra fields from .env (used by worker/frontend)
        case_sensitive=True,
        env_file=str(_env_file) if _env_file.exists() else ".env",
        env_file_encoding="utf-8",
    )


settings = Settings()

# Set JWKS URL if not provided
if not settings.COGNITO_JWKS_URL and settings.COGNITO_USER_POOL_ID:
    settings.COGNITO_JWKS_URL = (
        f"https://cognito-idp.{settings.COGNITO_REGION}.amazonaws.com/"
        f"{settings.COGNITO_USER_POOL_ID}/.well-known/jwks.json"
    )

# Validate production settings
if settings.ENVIRONMENT == "production" and settings.DEV_AUTH_BYPASS:
    raise ValueError("DEV_AUTH_BYPASS cannot be True in production")


def use_local_storage() -> bool:
    """True only when local storage is enabled and not in production."""
    if settings.ENVIRONMENT == "production":
        return False
    if not settings.STORAGE_LOCAL_ENABLED:
        return False
    return bool((settings.STORAGE_LOCAL_DIR or "").strip())
