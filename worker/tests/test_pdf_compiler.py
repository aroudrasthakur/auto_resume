"""Tests for PDF compilation."""

import tempfile
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from app.latex.compiler import compile_pdf


@patch("app.latex.compiler.subprocess.run")
@patch("app.latex.compiler.shutil.which")
def test_compile_pdf_success(mock_which, mock_subprocess):
    """Test successful PDF compilation."""
    mock_which.return_value = "/usr/bin/pdflatex"
    mock_subprocess.return_value = MagicMock(returncode=0)

    with tempfile.TemporaryDirectory() as tmpdir:
        pdf_path = Path(tmpdir) / "resume.pdf"
        pdf_path.write_bytes(b"PDF content")

        with patch("app.latex.compiler.tempfile.TemporaryDirectory") as mock_tmp:
            mock_tmp.return_value.__enter__.return_value = tmpdir
            mock_tmp.return_value.__exit__.return_value = False

            result = compile_pdf("\\documentclass{article}\\begin{document}Test\\end{document}")

    assert result == b"PDF content"


@patch("app.latex.compiler.subprocess.run")
@patch("app.latex.compiler.shutil.which")
def test_compile_pdf_timeout(mock_which, mock_subprocess):
    """Test PDF compilation timeout."""
    import subprocess

    mock_which.return_value = "/usr/bin/pdflatex"
    mock_subprocess.side_effect = subprocess.TimeoutExpired("pdflatex", 60)

    with pytest.raises(RuntimeError, match="timed out"):
        compile_pdf("\\documentclass{article}\\begin{document}Test\\end{document}")


def test_compile_pdf_no_engine():
    """Test that RuntimeError is raised when no LaTeX engine is found."""
    with patch("app.latex.compiler.shutil.which", return_value=None):
        with patch("app.latex.compiler.settings") as mock_settings:
            mock_settings.PDFLATEX_PATH = ""

            with pytest.raises(RuntimeError, match="No LaTeX engine"):
                compile_pdf("\\documentclass{article}\\begin{document}Test\\end{document}")
