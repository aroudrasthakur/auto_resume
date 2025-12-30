"""Pytest fixtures and configuration."""

import os
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.main import create_app


@pytest.fixture
def mock_supabase():
    """Mock Supabase client."""
    mock = MagicMock()
    mock.table.return_value = mock
    mock.select.return_value = mock
    mock.insert.return_value = mock
    mock.update.return_value = mock
    mock.delete.return_value = mock
    mock.eq.return_value = mock
    mock.execute.return_value = MagicMock(data=[])
    return mock


@pytest.fixture
def mock_user():
    """Mock authenticated user."""
    return {"user_id": "test-user-123", "email": "test@example.com"}


@pytest.fixture
def client(mock_supabase):
    """Test client."""
    # Set dev auth bypass for testing
    os.environ["DEV_AUTH_BYPASS"] = "true"
    app = create_app()
    return TestClient(app)


@pytest.fixture
def auth_headers():
    """Authorization headers."""
    return {"Authorization": "Bearer test-token"}

