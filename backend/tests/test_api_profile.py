"""Tests for profile API endpoints."""

import pytest
from unittest.mock import MagicMock


def test_create_profile(client, mock_supabase, auth_headers):
    """Test creating a profile."""
    mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [
        {
            "id": "test-id",
            "user_id": "test-user",
            "name": "Test User",
            "created_at": "2024-01-01",
            "updated_at": "2024-01-01",
        }
    ]
    response = client.post(
        "/api/v1/profiles",
        json={"name": "Test User"},
        headers=auth_headers,
    )
    assert response.status_code in [200, 201]


def test_get_profile_not_found(client, auth_headers):
    """Test getting non-existent profile."""
    response = client.get("/api/v1/profiles/invalid-id", headers=auth_headers)
    assert response.status_code == 404

