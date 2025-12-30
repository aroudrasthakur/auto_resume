"""AWS Cognito JWT validation."""

import json
from typing import Dict, Optional

import httpx
from jose import JWTError, jwt
from jose.utils import base64url_decode

from app.core.config import settings


class CognitoTokenError(Exception):
    """Error validating Cognito token."""

    pass


async def fetch_jwks() -> Dict:
    """Fetch JWKS from Cognito."""
    if not settings.COGNITO_JWKS_URL:
        raise CognitoTokenError("COGNITO_JWKS_URL not configured")

    async with httpx.AsyncClient() as client:
        response = await client.get(settings.COGNITO_JWKS_URL)
        response.raise_for_status()
        return response.json()


def get_kid_from_token(token: str) -> Optional[str]:
    """Extract kid (key ID) from JWT header."""
    try:
        headers = jwt.get_unverified_header(token)
        return headers.get("kid")
    except Exception:
        return None


def get_public_key(jwks: Dict, kid: str) -> Optional[str]:
    """Get public key from JWKS by kid."""
    for key in jwks.get("keys", []):
        if key.get("kid") == kid:
            return key
    return None


async def verify_cognito_token(token: str) -> Dict:
    """
    Verify and decode Cognito JWT token.

    Args:
        token: JWT access token from Cognito

    Returns:
        Decoded token payload with user information

    Raises:
        CognitoTokenError: If token is invalid
    """
    if settings.DEV_AUTH_BYPASS:
        # Return fake user for local development
        return {
            "sub": "dev-user-123",
            "email": "dev@example.com",
            "cognito:username": "dev-user",
        }

    try:
        # Fetch JWKS
        jwks = await fetch_jwks()

        # Get kid from token
        kid = get_kid_from_token(token)
        if not kid:
            raise CognitoTokenError("Token missing kid in header")

        # Get public key
        public_key = get_public_key(jwks, kid)
        if not public_key:
            raise CognitoTokenError(f"Public key not found for kid: {kid}")

        # Decode token
        decoded = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=settings.COGNITO_CLIENT_ID,
            issuer=f"https://cognito-idp.{settings.COGNITO_REGION}.amazonaws.com/{settings.COGNITO_USER_POOL_ID}",
        )

        return decoded

    except JWTError as e:
        raise CognitoTokenError(f"Invalid token: {e}") from e
    except Exception as e:
        raise CognitoTokenError(f"Token verification failed: {e}") from e

