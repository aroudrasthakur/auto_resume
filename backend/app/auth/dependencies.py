"""FastAPI dependencies for authentication."""

from typing import Annotated, Dict

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth.cognito import CognitoTokenError, verify_cognito_token

security = HTTPBearer()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]
) -> Dict[str, str]:
    """
    Get current authenticated user from JWT token.

    Returns:
        Dictionary with user_id (from 'sub' claim) and other user info

    Raises:
        HTTPException: If token is invalid or missing
    """
    token = credentials.credentials

    try:
        decoded = await verify_cognito_token(token)
        user_id = decoded.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing 'sub' claim",
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

