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
    template_dir = os.path.join(os.path.dirname(__file__), "../../../templates/jakes-resume")

    # Setup Jinja2 environment
    env = Environment(
        loader=FileSystemLoader(template_dir),
        autoescape=False,  # LaTeX has its own escaping
    )

    template = env.get_template("template.tex.jinja2")

    # Extract contact info from profile (guard against None)
    profile_data = profile_data or {}
    ai_output = ai_output or {}
    profile = (profile_data.get("profile") or {}) if isinstance(profile_data, dict) else {}
    contacts = (profile.get("contacts") or []) if isinstance(profile, dict) else []

    contact_dict = {}
    for contact in (contacts or []):
        if not isinstance(contact, dict):
            continue
        kind = (contact.get("contact_kind") or "").lower()
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

    # Normalize skills: ai_output may have {"categories": [...]} or a raw list
    skills_raw = ai_output.get("skills") or []
    skills_categories = (
        skills_raw.get("categories", skills_raw) if isinstance(skills_raw, dict) else skills_raw
    )

    def _esc(s):
        if s is None:
            return ""
        return escape_latex(str(s).replace("\r\n", " ").replace("\n", " ").replace("\r", " "))

    def _esc_edu(edu):
        if not isinstance(edu, dict):
            return {"school": "", "location": "", "start_date": "", "end_date": "", "degree": "", "major": "", "gpa": "", "highlights": []}
        return {
            "school": _esc(edu.get("school")),
            "location": _esc(edu.get("location")),
            "start_date": _esc(edu.get("start_date")),
            "end_date": _esc(edu.get("end_date")),
            "degree": _esc(edu.get("degree")),
            "major": _esc(edu.get("major")),
            "gpa": _esc(edu.get("gpa")),
            "highlights": [_esc(h) for h in edu.get("highlights", [])],
        }

    def _esc_exp(exp):
        if not isinstance(exp, dict):
            return {"company": "", "location": "", "start_date": "", "end_date": "", "role": "", "is_current": False, "bullets": []}
        bullets = exp.get("bullets", []) or []
        return {
            "company": _esc(exp.get("company")),
            "location": _esc(exp.get("location")),
            "start_date": _esc(exp.get("start_date")),
            "end_date": _esc(exp.get("end_date")),
            "role": _esc(exp.get("role")),
            "is_current": exp.get("is_current"),
            "bullets": [{"bullet": _esc(b.get("bullet") if isinstance(b, dict) else b)} for b in bullets],
        }

    def _esc_proj(proj):
        if not isinstance(proj, dict):
            return {"name": "", "start_date": "", "end_date": "", "role": "", "bullets": [], "technologies": []}
        bullets = proj.get("bullets", [])
        return {
            "name": _esc(proj.get("name")),
            "start_date": _esc(proj.get("start_date")),
            "end_date": _esc(proj.get("end_date")),
            "role": _esc(proj.get("role")),
            "bullets": [{"bullet": _esc(b.get("bullet") if isinstance(b, dict) else b)} for b in bullets],
            "technologies": [_esc(t) for t in proj.get("technologies", [])],
        }

    def _esc_skills(cats):
        if not isinstance(cats, (list, tuple)):
            return []
        result = []
        for c in (cats or []):
            if not isinstance(c, dict):
                continue
            items_raw = c.get("items") or []
            items = [_esc(i.get("item", i) if isinstance(i, dict) else i) for i in items_raw]
            result.append({"name": _esc(c.get("name")), "items": items})
        return result

    context = {
        "name": escape_latex(profile.get("name", profile.get("display_name", ""))),
        **contact_dict,
        "education": [_esc_edu(e) for e in ai_output.get("education", [])],
        "experience": [_esc_exp(e) for e in ai_output.get("experience", [])],
        "projects": [_esc_proj(p) for p in (ai_output.get("projects", []) if include_projects else [])],
        "skills": {"categories": _esc_skills(skills_categories)} if include_skills else None,
        "include_projects": include_projects,
        "include_skills": include_skills,
    }

    # Render template
    return template.render(**context)
