"""LaTeX escaping utilities."""

import re


def escape_latex(text: str) -> str:
    """
    Escape special LaTeX characters in text.

    Escapes: &, %, $, #, _, {, }, ~, ^, \\
    Preserves URLs and emails when possible.

    Args:
        text: Input text to escape

    Returns:
        Escaped text safe for LaTeX
    """
    if not text:
        return ""
    text = str(text)

    # LaTeX special characters that need escaping
    # Order matters: escape backslash first
    # Replace \ with / to avoid "Undefined control sequence" ({\char92}C -> \C)
    replacements = [
        ("\\", "/"),
        ("&", r"\&"),
        ("%", r"\%"),
        ("$", r"\$"),
        ("#", r"\#"),
        ("_", r"\_"),
        ("{", r"\{"),
        ("}", r"\}"),
        ("~", r"{\char126}"),
        ("^", r"{\char94}"),
    ]

    result = text
    for old, new in replacements:
        result = result.replace(old, new)

    return result


def escape_latex_url(url: str) -> str:
    """
    Escape URL for LaTeX while preserving URL structure.

    Args:
        url: URL to escape

    Returns:
        Escaped URL
    """
    # URLs in LaTeX should use \url{} command
    # But we still need to escape special chars that might break the command
    escaped = escape_latex(url)
    return escaped


def escape_latex_email(email: str) -> str:
    """
    Escape email for LaTeX.

    Args:
        email: Email address to escape

    Returns:
        Escaped email
    """
    # Emails can use \href{mailto:...}{...} but for simplicity, just escape
    return escape_latex(email)

