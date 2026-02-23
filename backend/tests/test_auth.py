"""Tests for authentication."""

from unittest.mock import patch

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
async def test_verify_cognito_token_invalid():
    """Test invalid token raises error."""
    with patch("app.auth.cognito.settings") as mock_settings:
        mock_settings.DEV_AUTH_BYPASS = False
        mock_settings.COGNITO_JWKS_URL = "https://invalid.url/jwks.json"
        mock_settings.COGNITO_CLIENT_ID = "test-client"
        mock_settings.COGNITO_REGION = "us-east-1"
        mock_settings.COGNITO_USER_POOL_ID = "us-east-1_xxx"
        with pytest.raises(CognitoTokenError):
            await verify_cognito_token("invalid-token")
