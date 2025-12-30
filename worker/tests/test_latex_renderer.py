"""Tests for LaTeX rendering."""

from worker.app.latex.renderer import render_latex


def test_render_latex_basic():
    """Test basic LaTeX rendering."""
    profile_data = {
        "profile": {"name": "John Doe", "contacts": []},
    }
    ai_output = {
        "education": [],
        "experience": [],
        "projects": [],
        "skills": [],
    }
    result = render_latex(profile_data, ai_output, True, True)
    assert "\\documentclass{resume}" in result
    assert "John Doe" in result

