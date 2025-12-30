"""Tests for mock AI adapter."""

from worker.app.ai.mock_adapter import MockAdapter


def test_mock_adapter_generate_content():
    """Test mock adapter returns valid content."""
    adapter = MockAdapter()
    profile_snapshot = {
        "education": [{"id": "edu-1", "school": "Test University"}],
        "experience": [
            {
                "id": "exp-1",
                "company": "Test Corp",
                "experience_bullet": [{"bullet": "Did something"}],
            }
        ],
        "projects": [],
        "skills": [],
    }
    result = adapter.generate_content(
        profile_snapshot=profile_snapshot,
        job_description="Test JD",
        page_count=1,
        include_projects=True,
        include_skills=True,
    )
    assert "education" in result
    assert "experience" in result
    assert adapter.get_provider_name() == "mock"

