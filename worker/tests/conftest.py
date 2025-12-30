"""Pytest fixtures for worker tests."""

import pytest
from unittest.mock import MagicMock


@pytest.fixture
def mock_supabase():
    """Mock Supabase client."""
    mock = MagicMock()
    mock.table.return_value = mock
    mock.select.return_value = mock
    mock.insert.return_value = mock
    mock.update.return_value = mock
    mock.eq.return_value = mock
    mock.execute.return_value = MagicMock(data=[])
    return mock


@pytest.fixture
def profile_snapshot():
    """Sample profile snapshot."""
    return {
        "profile": {
            "id": "profile-1",
            "name": "John Doe",
            "email": "john@example.com",
        },
        "education": [],
        "experience": [],
        "projects": [],
        "skills": [],
    }

