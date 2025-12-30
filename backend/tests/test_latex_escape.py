"""Tests for LaTeX escaping."""

from shared.app.utils.latex import escape_latex


def test_escape_latex_basic():
    """Test basic LaTeX escaping."""
    assert escape_latex("Hello & World") == r"Hello \& World"
    assert escape_latex("100%") == r"100\%"
    assert escape_latex("$100") == r"\$100"


def test_escape_latex_empty():
    """Test empty string."""
    assert escape_latex("") == ""
    assert escape_latex(None) == ""

