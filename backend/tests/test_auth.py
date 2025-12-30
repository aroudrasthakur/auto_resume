"""Tests for authentication."""

import pytest
from app.auth.cognito import CognitoTokenError, verify_cognito_token


@pytest.mark.asyncio
async def test_verify_cognito_token_dev_bypass(monkeypatch):
    """Test dev auth bypass."""
    monkeypatch.setenv("DEV_AUTH_BYPASS", "true")
    result = await verify_cognito_token("fake-token")
    assert result["sub"] == "dev-user-123"
    assert result["email"] == "dev@example.com"


@pytest.mark.asyncio
async def test_verify_cognito_token_invalid(monkeypatch):
    """Test invalid token raises error."""
    monkeypatch.setenv("DEV_AUTH_BYPASS", "false")
    monkeypatch.setenv("COGNITO_JWKS_URL", "https://invalid.url/jwks.json")
    with pytest.raises(CognitoTokenError):
        await verify_cognito_token("invalid-token")

