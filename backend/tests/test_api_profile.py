"""Tests for profile API endpoints."""

from unittest.mock import MagicMock

import pytest

from app.auth.dependencies import DEV_USER_ID


def test_create_profile(client, mock_supabase, auth_headers):
    """Test creating a profile."""
    profile_id = "00000000-0000-0000-0000-000000000001"
    profile_row = {
        "id": profile_id,
        "user_id": DEV_USER_ID,
        "name": "Test User",
        "headline": None,
        "summary": None,
        "location": None,
        "created_at": "2024-01-01",
        "updated_at": "2024-01-01",
    }
    # insert execute, profile select execute, contacts select execute (shared mock chain)
    mock_supabase.table.return_value.execute.side_effect = [
        MagicMock(data=[profile_row]),
        MagicMock(data=[profile_row]),
        MagicMock(data=[]),
    ]
    response = client.post(
        "/api/v1/profiles",
        json={"name": "Test User"},
        headers=auth_headers,
    )
    assert response.status_code in [200, 201]


def test_get_profile_not_found(client, auth_headers):
    """Test getting non-existent profile."""
    # Use valid UUID format; mock returns no data so profile not found
    response = client.get(
        "/api/v1/profiles/00000000-0000-0000-0000-000000000001",
        headers=auth_headers,
    )
    assert response.status_code == 404
