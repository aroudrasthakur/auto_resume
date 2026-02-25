"""FastAPI dependencies for authentication."""

from typing import Annotated, Dict, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth.cognito import CognitoTokenError, verify_cognito_token
from app.core.config import settings
from app.core.db import get_supabase_client

# When auto_error=False, missing Authorization header yields None instead of 401
security = HTTPBearer(auto_error=False)

# Dev user ID (UUID) used when DEV_AUTH_BYPASS is True and no token is sent (e.g. incognito).
# Ensure app_user has a row with this id so profiles/experience load from Supabase.
DEV_USER_ID = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"


def _ensure_app_user(
    supabase, user_id: str, email: Optional[str] = None, cognito_username: Optional[str] = None
):
    """Upsert user into app_user so profile/experience FKs are satisfied."""
    try:
        supabase.table("app_user").upsert(
            {
                "id": user_id,
                "cognito_sub": user_id,
                "email": email,
            },
            on_conflict="id",
        ).execute()
    except Exception:
        # Ignore upsert errors (e.g. RLS); user may already exist
        pass


async def get_current_user(
    credentials: Annotated[Optional[HTTPAuthorizationCredentials], Depends(security)],
    supabase=Depends(get_supabase_client),
) -> Dict[str, str]:
    """
    Get current authenticated user from JWT token, or dev user when bypass is enabled.

    When DEV_AUTH_BYPASS is True and no Bearer token is sent, returns the dev user
    so the API can load data from Supabase for local/incognito use.
    """
    if settings.DEV_AUTH_BYPASS and not credentials:
        _ensure_app_user(
            supabase, DEV_USER_ID, email="dev@example.com", cognito_username="dev-user"
        )
        return {
            "user_id": DEV_USER_ID,
            "email": "dev@example.com",
            "cognito_username": "dev-user",
        }

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        decoded = await verify_cognito_token(token)
        user_id = decoded.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing 'sub' claim",
            )

        # When DEV_AUTH_BYPASS returns fake "dev-user-123", map to valid UUID for DB queries
        if settings.DEV_AUTH_BYPASS and user_id == "dev-user-123":
            user_id = DEV_USER_ID

        # Ensure app_user row exists so profile/experience FKs are satisfied
        _ensure_app_user(
            supabase,
            user_id,
            email=decoded.get("email"),
            cognito_username=decoded.get("cognito:username"),
        )

        return {
            "user_id": user_id,
            "email": decoded.get("email"),
            "cognito_username": decoded.get("cognito:username"),
        }
    except CognitoTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e
