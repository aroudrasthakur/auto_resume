"""LaTeX to PDF compilation using pdflatex or Tectonic."""

import os
import shutil
import subprocess
import tempfile
from pathlib import Path

from app.core.config import settings

# Template dir for resume.cls: project root is 3 levels up from worker/app/latex/compiler.py
_TEMPLATE_DIR = Path(__file__).resolve().parents[3] / "templates" / "jakes-resume"

# Minimal fontconfig for Tectonic on Windows (avoids "Cannot load default config file")
_MINIMAL_FONTS_CONF = """<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">
<fontconfig><dir>C:/Windows/Fonts</dir></fontconfig>
"""


def _get_engines():
    """Build engine list; use PDFLATEX_PATH from .env if set."""
    pdflatex_path = (settings.PDFLATEX_PATH or "").strip()
    if pdflatex_path and Path(pdflatex_path).exists():
        return [
            (
                "pdflatex",
                [
                    pdflatex_path,
                    "-interaction=nonstopmode",
                    "-halt-on-error",
                    "resume.tex",
                ],
            ),
            ("tectonic", ["tectonic", "--outdir", ".", "--untrusted", "resume.tex"]),
        ]
    return [
        (
            "pdflatex",
            ["pdflatex", "-interaction=nonstopmode", "-halt-on-error", "resume.tex"],
        ),
        ("tectonic", ["tectonic", "--outdir", ".", "--untrusted", "resume.tex"]),
    ]


_NO_ENGINE_MSG = (
    "No LaTeX engine (pdflatex/tectonic) found on PATH. "
    "Install MiKTeX from https://miktex.org/download or Tectonic from "
    "https://tectonic-typesetting.github.io/ — then start the Celery worker from a shell "
    "where the LaTeX bin is on PATH (e.g. restart terminal after installing MiKTeX)."
)


def compile_pdf(latex_content: str) -> bytes:
    """
    Compile LaTeX content to PDF using pdflatex or Tectonic.

    Args:
        latex_content: LaTeX source code

    Returns:
        PDF file bytes

    Raises:
        RuntimeError: If compilation fails or no LaTeX engine is installed
    """
    engines = _get_engines()
    engine_found = any(
        Path(cmd[0]).exists() if Path(cmd[0]).is_absolute() else shutil.which(cmd[0])
        for _, cmd in engines
    )
    if not engine_found:
        raise RuntimeError(_NO_ENGINE_MSG)

    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir = Path(tmpdir)

        # Copy template assets (resume.cls) so \documentclass{resume} works
        cls_src = _TEMPLATE_DIR / "resume.cls"
        if cls_src.exists():
            shutil.copy(cls_src, tmpdir / "resume.cls")

        # Write LaTeX file
        tex_file = tmpdir / "resume.tex"
        tex_file.write_text(latex_content, encoding="utf-8")

        # Write minimal fontconfig for Tectonic on Windows
        fonts_conf = tmpdir / "fonts.conf"
        fonts_conf.write_text(_MINIMAL_FONTS_CONF, encoding="utf-8")
        env = os.environ.copy()
        env["FONTCONFIG_FILE"] = str(fonts_conf)

        last_error = None
        for engine_name, cmd in engines:
            try:
                result = subprocess.run(
                    cmd,
                    cwd=str(tmpdir),
                    capture_output=True,
                    text=True,
                    timeout=60,
                    check=True,
                    env=env,
                )
                pdf_file = tmpdir / "resume.pdf"
                if pdf_file.exists():
                    return pdf_file.read_bytes()
            except FileNotFoundError:
                last_error = RuntimeError(_NO_ENGINE_MSG)
                continue
            except subprocess.TimeoutExpired:
                raise RuntimeError("LaTeX compilation timed out")
            except subprocess.CalledProcessError as e:
                # Save failed .tex for debugging (in project root)
                try:
                    debug_path = Path(__file__).resolve().parents[3] / "resume_failed.tex"
                    debug_path.write_text(latex_content, encoding="utf-8")
                except Exception:
                    pass
                last_error = RuntimeError(f"LaTeX compilation failed: {e.stderr or e.stdout}")
                continue

        if last_error:
            raise last_error
        raise RuntimeError("PDF file was not generated")
