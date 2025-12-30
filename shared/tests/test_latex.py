"""Tests for LaTeX escaping utilities."""

import pytest

from shared.app.utils.latex import escape_latex, escape_latex_email, escape_latex_url


def test_escape_latex_basic():
    """Test basic LaTeX character escaping."""
    assert escape_latex("Hello & World") == r"Hello \& World"
    assert escape_latex("100%") == r"100\%"
    assert escape_latex("$100") == r"\$100"
    assert escape_latex("C#") == r"C\#"
    assert escape_latex("user_name") == r"user\_name"
    assert escape_latex("{value}") == r"\{value\}"


def test_escape_latex_backslash():
    """Test backslash escaping."""
    assert escape_latex("path\\to\\file") == r"path\textbackslash{}to\textbackslash{}file"


def test_escape_latex_special_chars():
    """Test special character escaping."""
    assert escape_latex("~tilde^caret") == r"\textasciitilde{}tilde\textasciicircum{}caret"


def test_escape_latex_empty():
    """Test empty string handling."""
    assert escape_latex("") == ""
    assert escape_latex(None) == ""


def test_escape_latex_url():
    """Test URL escaping."""
    url = "https://example.com/path?query=value&other=test"
    escaped = escape_latex_url(url)
    assert "\\&" in escaped or "&" not in escaped


def test_escape_latex_email():
    """Test email escaping."""
    email = "user@example.com"
    escaped = escape_latex_email(email)
    assert "@" in escaped  # @ doesn't need escaping
    assert "\\" in escaped or email == escaped  # May or may not need escaping


def test_escape_latex_complex():
    """Test complex text with multiple special characters."""
    text = "Project: 100% complete, cost $500, user_name@example.com"
    escaped = escape_latex(text)
    assert "\\%" in escaped
    assert "\\$" in escaped
    assert "\\_" in escaped

