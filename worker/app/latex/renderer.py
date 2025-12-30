"""LaTeX template rendering."""

import os
from typing import Dict

from jinja2 import Environment, FileSystemLoader

from shared.app.utils.latex import escape_latex


def render_latex(
    profile_data: Dict,
    ai_output: Dict,
    include_projects: bool,
    include_skills: bool,
) -> str:
    """
    Render LaTeX template with profile and AI output data.

    Args:
        profile_data: Full profile snapshot
        ai_output: AI-selected content
        include_projects: Whether to include projects section
        include_skills: Whether to include skills section

    Returns:
        Rendered LaTeX content
    """
    # Get template directory
    template_dir = os.path.join(
        os.path.dirname(__file__), "../../../templates/jakes-resume"
    )

    # Setup Jinja2 environment
    env = Environment(
        loader=FileSystemLoader(template_dir),
        autoescape=False,  # LaTeX has its own escaping
    )

    template = env.get_template("template.tex.jinja2")

    # Extract contact info from profile
    profile = profile_data.get("profile", {})
    contacts = profile.get("contacts", [])

    contact_dict = {}
    for contact in contacts:
        kind = contact.get("contact_kind", "").lower()
        value = contact.get("value", "")
        if kind == "email":
            contact_dict["email"] = escape_latex(value)
        elif kind == "phone":
            contact_dict["phone"] = escape_latex(value)
        elif kind == "location":
            contact_dict["location"] = escape_latex(value)
        elif kind == "linkedin":
            contact_dict["linkedin"] = escape_latex(value)
        elif kind == "github":
            contact_dict["github"] = escape_latex(value)
        elif kind == "website":
            contact_dict["website"] = escape_latex(value)

    # Prepare template context
    context = {
        "name": escape_latex(profile.get("name", "")),
        **contact_dict,
        "education": ai_output.get("education", []),
        "experience": ai_output.get("experience", []),
        "projects": ai_output.get("projects", []) if include_projects else [],
        "skills": {"categories": ai_output.get("skills", [])} if include_skills else None,
        "include_projects": include_projects,
        "include_skills": include_skills,
    }

    # Render template
    return template.render(**context)

