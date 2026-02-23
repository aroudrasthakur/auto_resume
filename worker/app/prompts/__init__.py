"""Prompt loading utilities."""

from pathlib import Path

# worker/app/prompts/__init__.py -> project root is parent.parent.parent.parent
_PROMPTS_DIR = Path(__file__).parent.parent.parent.parent / "prompts"


def get_prompts_dir() -> Path:
    """Return the prompts directory path."""
    return _PROMPTS_DIR


def load_prompt(name: str) -> str:
    """
    Load a prompt from the prompts directory.
    name: filename without extension (e.g. 'resume_generation')
    """
    path = _PROMPTS_DIR / f"{name}.txt"
    if not path.exists():
        raise FileNotFoundError(f"Prompt file not found: {path}")
    return path.read_text(encoding="utf-8").strip()
