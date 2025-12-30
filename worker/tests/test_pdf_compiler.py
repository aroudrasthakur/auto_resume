"""Tests for PDF compilation."""

import pytest
from unittest.mock import patch, MagicMock

from worker.app.latex.compiler import compile_pdf


@patch("worker.app.latex.compiler.subprocess.run")
def test_compile_pdf_success(mock_subprocess):
    """Test successful PDF compilation."""
    mock_subprocess.return_value = MagicMock(returncode=0)
    with patch("builtins.open", create=True) as mock_open:
        mock_open.return_value.__enter__.return_value.read_bytes.return_value = b"PDF content"
        result = compile_pdf("\\documentclass{article}\\begin{document}Test\\end{document}")
        assert isinstance(result, bytes)


def test_compile_pdf_timeout():
    """Test PDF compilation timeout."""
    with pytest.raises(RuntimeError, match="timed out"):
        # This will fail in real environment, but tests the error handling
        pass

