"""LangChain-based 2-step resume pipeline: generate bullets, then finalize."""

import json
from typing import Any, Callable, Dict, Optional

from langchain_core.output_parsers import JsonOutputParser
from langchain_openai import ChatOpenAI
from shared.app.constants import PAGE_COUNT_LIMITS

from app.core.config import settings
from app.prompts import load_prompt

TEMPLATE_SNIPPET = """Jakes Resume Template Structure:
- Education: school, location, start_date, end_date, degree, major, gpa, highlights (array of strings)
- Experience: company, location, start_date, end_date, role, is_current, bullets (array of objects with "bullet" key)
- Projects: name, start_date, end_date, role, bullets (array of {bullet}), technologies (array of strings)
- Skills: {categories: [{name, items: [strings]}]}"""


def _get_llm() -> ChatOpenAI:
    """Get configured ChatOpenAI instance."""
    api_key = settings.OPENAI_API_KEY
    if not api_key:
        raise ValueError("OPENAI_API_KEY is required")
    model = getattr(settings, "OPENAI_MODEL", "gpt-4o-mini")
    return ChatOpenAI(
        model=model,
        api_key=api_key,
        temperature=0.2,
    )


_PROFILE_KEEP = {
    "display_name",
    "email",
    "phone",
    "location",
    "linkedin_url",
    "github_url",
    "website_url",
}


def _transform_profile_to_flat(profile_snapshot: Dict) -> Dict:
    """
    Transform profile snapshot to a flat format for prompts, trimming non-essential fields.
    """
    profile = {
        k: v for k, v in (profile_snapshot.get("profile") or {}).items() if k in _PROFILE_KEEP
    }
    education = []
    for edu in profile_snapshot.get("education", []):
        hl = edu.get("education_highlight", edu.get("highlights", []))
        education.append(
            {
                "school": edu.get("school"),
                "location": edu.get("location"),
                "start_date": edu.get("start_date"),
                "end_date": edu.get("end_date"),
                "degree": edu.get("degree"),
                "major": edu.get("major"),
                "gpa": edu.get("gpa"),
                "highlights": [
                    h.get("highlight", h.get("bullet", str(h))) if isinstance(h, dict) else str(h)
                    for h in hl
                ],
            }
        )
    experience = []
    for exp in profile_snapshot.get("experience", []):
        bullets = exp.get("experience_bullet", exp.get("bullets", []))
        experience.append(
            {
                "company": exp.get("company"),
                "location": exp.get("location"),
                "start_date": exp.get("start_date"),
                "end_date": exp.get("end_date"),
                "role": exp.get("role"),
                "is_current": exp.get("is_current"),
                "bullets": [
                    b.get("bullet", b.get("highlight", str(b))) if isinstance(b, dict) else str(b)
                    for b in bullets
                ],
            }
        )
    projects = []
    for proj in profile_snapshot.get("projects", []):
        projects.append(
            {
                "name": proj.get("name"),
                "start_date": proj.get("start_date"),
                "end_date": proj.get("end_date"),
                "role": proj.get("role"),
                "bullets": [
                    b.get("bullet", str(b)) if isinstance(b, dict) else str(b)
                    for b in proj.get("project_bullet", proj.get("bullets", []))
                ],
                "technologies": [
                    t.get("tech", str(t)) if isinstance(t, dict) else str(t)
                    for t in proj.get("project_tech", proj.get("technologies", []))
                ],
            }
        )
    skills = []
    for cat in profile_snapshot.get("skills", []):
        items = cat.get("skill_item", cat.get("items", []))
        skills.append(
            {
                "name": cat.get("name", ""),
                "items": [i.get("item", str(i)) if isinstance(i, dict) else str(i) for i in items],
            }
        )
    return {
        "profile": profile,
        "education": education,
        "experience": experience,
        "projects": projects,
        "skills": {"categories": skills},
    }


def _apply_page_limits(
    output: Dict,
    page_count: int,
    include_projects: bool,
    include_skills: bool,
) -> Dict:
    """
    Apply page count limits in code: trim bullets, cap projects/education.
    """
    limits = PAGE_COUNT_LIMITS.get(page_count, PAGE_COUNT_LIMITS[3])
    max_bullets = limits.get("max_bullets_per_experience", 3)
    max_projects = limits.get("max_projects", 2)
    max_educations = limits.get("max_educations") or 10

    result: Dict[str, Any] = dict(output)

    # Trim education
    edu_list = result.get("education", [])
    if max_educations and len(edu_list) > max_educations:
        result["education"] = edu_list[:max_educations]

    # Trim experience bullets
    for exp in result.get("experience", []):
        bullets_raw = exp.get("bullets", exp.get("experience_bullet", []))
        bullets = []
        for b in bullets_raw[:max_bullets]:
            if isinstance(b, dict):
                bullets.append({"bullet": b.get("bullet", b.get("highlight", str(b)))})
            else:
                bullets.append({"bullet": str(b)})
        exp["bullets"] = bullets

    # Trim projects
    if include_projects:
        proj_list = result.get("projects", [])
        if max_projects and len(proj_list) > max_projects:
            result["projects"] = proj_list[:max_projects]

    return result


def _ensure_output_schema(output: Dict, include_projects: bool, include_skills: bool) -> Dict:
    """
    Ensure AI output matches the template schema.
    """
    result: Dict[str, Any] = {
        "education": [],
        "experience": [],
        "projects": [] if include_projects else [],
        "skills": {"categories": []} if include_skills else {"categories": []},
    }

    for edu in output.get("education", []):
        if isinstance(edu, dict):
            highlights = edu.get("highlights", edu.get("education_highlight", []))
            if highlights and isinstance(highlights[0], dict):
                highlights = [h.get("highlight", h.get("bullet", str(h))) for h in highlights]
            result["education"].append(
                {
                    "school": edu.get("school", ""),
                    "location": edu.get("location"),
                    "start_date": edu.get("start_date"),
                    "end_date": edu.get("end_date"),
                    "degree": edu.get("degree"),
                    "major": edu.get("major"),
                    "gpa": edu.get("gpa"),
                    "highlights": highlights if isinstance(highlights, list) else [],
                }
            )

    for exp in output.get("experience", []):
        if isinstance(exp, dict):
            bullets_raw = exp.get("bullets", exp.get("experience_bullet", []))
            bullets = []
            for b in bullets_raw:
                if isinstance(b, dict):
                    bullets.append({"bullet": b.get("bullet", b.get("highlight", str(b)))})
                else:
                    bullets.append({"bullet": str(b)})
            result["experience"].append(
                {
                    "company": exp.get("company", ""),
                    "location": exp.get("location"),
                    "start_date": exp.get("start_date"),
                    "end_date": exp.get("end_date"),
                    "role": exp.get("role", ""),
                    "is_current": exp.get("is_current", False),
                    "bullets": bullets,
                }
            )

    if include_projects:
        for proj in output.get("projects", []):
            if isinstance(proj, dict):
                bullets_raw = proj.get("bullets", proj.get("project_bullet", []))
                bullets = []
                for b in bullets_raw:
                    if isinstance(b, dict):
                        bullets.append({"bullet": b.get("bullet", str(b))})
                    else:
                        bullets.append({"bullet": str(b)})
                tech_raw = proj.get("technologies", proj.get("project_tech", []))
                technologies = [
                    t.get("tech", str(t)) if isinstance(t, dict) else str(t) for t in tech_raw
                ]
                result["projects"].append(
                    {
                        "name": proj.get("name", ""),
                        "start_date": proj.get("start_date"),
                        "end_date": proj.get("end_date"),
                        "role": proj.get("role"),
                        "bullets": bullets,
                        "technologies": technologies,
                    }
                )

    if include_skills:
        skills_raw = output.get("skills", [])
        if isinstance(skills_raw, dict) and "categories" in skills_raw:
            skills_raw = skills_raw["categories"]
        for cat in skills_raw:
            if isinstance(cat, dict):
                items_raw = cat.get("items", cat.get("skill_item", []))
                items = [
                    i.get("item", str(i)) if isinstance(i, dict) else str(i) for i in items_raw
                ]
                result["skills"]["categories"].append(
                    {
                        "name": cat.get("name", ""),
                        "items": items,
                    }
                )

    return result


def _build_step1_message(
    job_description: str,
    profile_json: str,
    prompt_text: str,
    include_projects: str,
    include_skills: str,
) -> str:
    """Build the first OpenAI message: JOB DESCRIPTION / PROFILE / PROMPT."""
    prompt_filled = prompt_text.replace("{include_projects}", include_projects).replace(
        "{include_skills}", include_skills
    )
    return f"""JOB DESCRIPTION:
{job_description}

PROFILE:
{profile_json}

PROMPT:
{prompt_filled}"""


def _build_step2_message(
    template_snippet: str,
    bullets_json: str,
    profile_json: str,
    prompt_text: str,
) -> str:
    """Build the second OpenAI message: TEMPLATE / BULLETS / PROFILE / PROMPT."""
    return f"""TEMPLATE:
{template_snippet}

BULLETS:
{bullets_json}

PROFILE:
{profile_json}

PROMPT:
{prompt_text}"""


def run_pipeline(
    profile_snapshot: Dict,
    job_description: str,
    page_count: int,
    include_projects: bool,
    include_skills: bool,
    update_step: Optional[Callable[[str], None]] = None,
) -> Dict:
    """
    Run the 2-step pipeline: (1) generate ATS bullets, (2) finalize resume.
    Applies page limits in code after step 1.
    """

    def _step(s: str) -> None:
        if update_step:
            update_step(s)

    llm = _get_llm()
    parser = JsonOutputParser()

    profile_flat = _transform_profile_to_flat(profile_snapshot)
    profile_json = json.dumps(profile_flat, indent=2)

    # Step 1: Generate ATS-optimized bullets
    _step("GENERATING_BULLETS")
    prompt1_text = load_prompt("resume_generation")
    step1_message = _build_step1_message(
        job_description=job_description,
        profile_json=profile_json,
        prompt_text=prompt1_text,
        include_projects=str(include_projects),
        include_skills=str(include_skills),
    )
    chain1 = llm | parser
    step1_output = chain1.invoke(step1_message)

    # Apply page limits in code
    step1_trimmed = _apply_page_limits(
        step1_output,
        page_count=page_count,
        include_projects=include_projects,
        include_skills=include_skills,
    )

    # Step 2: Finalize resume (bullets + contact only; skip full profile to save tokens)
    _step("FINALIZING_RESUME")
    prompt2_text = load_prompt("resume_finalize")
    contact_json = json.dumps(profile_flat.get("profile", {}), indent=2)
    step2_message = _build_step2_message(
        template_snippet=TEMPLATE_SNIPPET,
        bullets_json=json.dumps(step1_trimmed, indent=2),
        profile_json=contact_json,
        prompt_text=prompt2_text,
    )
    chain2 = llm | parser
    step2_output = chain2.invoke(step2_message)

    return _ensure_output_schema(step2_output, include_projects, include_skills)
