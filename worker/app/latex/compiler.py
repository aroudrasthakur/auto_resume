"""LaTeX to PDF compilation using Tectonic."""

import subprocess
import tempfile
from pathlib import Path


def compile_pdf(latex_content: str) -> bytes:
    """
    Compile LaTeX content to PDF using Tectonic.

    Args:
        latex_content: LaTeX source code

    Returns:
        PDF file bytes

    Raises:
        RuntimeError: If compilation fails
    """
    with tempfile.TemporaryDirectory() as tmpdir:
        # Write LaTeX file
        tex_file = Path(tmpdir) / "resume.tex"
        tex_file.write_text(latex_content, encoding="utf-8")

        # Compile with Tectonic
        try:
            result = subprocess.run(
                [
                    "tectonic",
                    "--outdir",
                    str(tmpdir),
                    "--untrusted",
                    str(tex_file),
                ],
                capture_output=True,
                text=True,
                timeout=30,
                check=True,
            )
        except subprocess.TimeoutExpired:
            raise RuntimeError("LaTeX compilation timed out")
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"LaTeX compilation failed: {e.stderr}")

        # Read PDF
        pdf_file = Path(tmpdir) / "resume.pdf"
        if not pdf_file.exists():
            raise RuntimeError("PDF file was not generated")

        return pdf_file.read_bytes()

