"""Application configuration."""

import os
from typing import List

try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings


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
    COGNITO_REGION: str = "us-east-1"
    COGNITO_JWKS_URL: str = ""
    DEV_AUTH_BYPASS: bool = False

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    ENVIRONMENT: str = "development"

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 100
    RATE_LIMIT_GENERATE_PER_HOUR: int = 10

    class Config:
        env_file = ".env"
        case_sensitive = True


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

