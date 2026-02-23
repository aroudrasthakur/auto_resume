"""LangChain-based multi-step resume refinement pipeline."""

import json
from typing import Any, Dict

from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from app.core.config import settings
from shared.app.constants import PAGE_COUNT_LIMITS


def _get_llm() -> ChatOpenAI:
    """Get configured ChatOpenAI instance."""
    api_key = settings.OPENAI_API_KEY
    if not api_key:
        raise ValueError("OPENAI_API_KEY is required")
    return ChatOpenAI(
        model="gpt-4o",
        api_key=api_key,
        temperature=0.3,
    )


def _transform_profile_to_flat(profile_snapshot: Dict) -> Dict:
    """
    Transform profile snapshot from DB structure to a flatter format for prompts.
    Keeps the structure but makes it easier for the model to parse.
    """
    return {
        "profile": profile_snapshot.get("profile", {}),
        "education": profile_snapshot.get("education", []),
        "experience": profile_snapshot.get("experience", []),
        "projects": profile_snapshot.get("projects", []),
        "skills": profile_snapshot.get("skills", []),
    }


def _ensure_output_schema(output: Dict, include_projects: bool, include_skills: bool) -> Dict:
    """
    Ensure AI output matches the template schema.
    - education: [{school, location, start_date, end_date, degree, major, gpa, highlights: [str]}]
    - experience: [{company, location, start_date, end_date, role, is_current, bullets: [{bullet}]}]
    - projects: [{name, start_date, end_date, role, bullets: [{bullet}], technologies: [str]}]
    - skills: {categories: [{name, items: [str]}]}
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
            result["education"].append({
                "school": edu.get("school", ""),
                "location": edu.get("location"),
                "start_date": edu.get("start_date"),
                "end_date": edu.get("end_date"),
                "degree": edu.get("degree"),
                "major": edu.get("major"),
                "gpa": edu.get("gpa"),
                "highlights": highlights if isinstance(highlights, list) else [],
            })

    for exp in output.get("experience", []):
        if isinstance(exp, dict):
            bullets_raw = exp.get("bullets", exp.get("experience_bullet", []))
            bullets = []
            for b in bullets_raw:
                if isinstance(b, dict):
                    bullets.append({"bullet": b.get("bullet", b.get("highlight", str(b)))})
                else:
                    bullets.append({"bullet": str(b)})
            result["experience"].append({
                "company": exp.get("company", ""),
                "location": exp.get("location"),
                "start_date": exp.get("start_date"),
                "end_date": exp.get("end_date"),
                "role": exp.get("role", ""),
                "is_current": exp.get("is_current", False),
                "bullets": bullets,
            })

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
                technologies = [t.get("tech", str(t)) if isinstance(t, dict) else str(t) for t in tech_raw]
                result["projects"].append({
                    "name": proj.get("name", ""),
                    "start_date": proj.get("start_date"),
                    "end_date": proj.get("end_date"),
                    "role": proj.get("role"),
                    "bullets": bullets,
                    "technologies": technologies,
                })

    if include_skills:
        skills_raw = output.get("skills", [])
        if isinstance(skills_raw, dict) and "categories" in skills_raw:
            skills_raw = skills_raw["categories"]
        for cat in skills_raw:
            if isinstance(cat, dict):
                items_raw = cat.get("items", cat.get("skill_item", []))
                items = [i.get("item", str(i)) if isinstance(i, dict) else str(i) for i in items_raw]
                result["skills"]["categories"].append({
                    "name": cat.get("name", ""),
                    "items": items,
                })

    return result


STEP1_SYSTEM = """You are a resume content selector. Your job is to select the most relevant content from a candidate's profile for a specific job description.

RULES:
- ONLY use content from the provided profile. DO NOT invent companies, dates, degrees, or accomplishments.
- Select education, experience, projects, and skills most relevant to the job description.
- Preserve the exact structure: education_highlight -> highlights, experience_bullet -> bullets, project_bullet -> bullets, project_tech -> technologies, skill_item -> items.
- Return valid JSON with keys: education, experience, projects, skills.
- Each education needs: school, location, start_date, end_date, degree, major, gpa, highlights (array of strings).
- Each experience needs: company, location, start_date, end_date, role, is_current, bullets (array of objects with "bullet" key).
- Each project needs: name, start_date, end_date, role, bullets (array of {bullet}), technologies (array of strings).
- Skills: {categories: [{name, items: [strings]}]}."""

STEP1_USER = """Job Description:
{job_description}

Profile Data (use ONLY this content):
{profile_json}

Include projects: {include_projects}
Include skills: {include_skills}

Select the most relevant content. Return JSON only."""

STEP2_SYSTEM = """You are a resume optimizer. Refine the selected content for the job description.

RULES:
- Use strong action verbs (Led, Developed, Implemented, etc.).
- Quantify impact where possible (percentages, numbers, scale).
- Align keywords from the job description naturally.
- Keep the exact JSON structure. Return valid JSON with keys: education, experience, projects, skills."""

STEP2_USER = """Job Description:
{job_description}

Current resume content:
{content_json}

Refine and optimize. Return JSON only."""

STEP3_SYSTEM = """You are an ATS (Applicant Tracking System) compliance expert. Ensure resume content is ATS-friendly.

RULES:
- No tables, images, or complex formatting - use simple bullet structure.
- Standard section headers: Education, Experience, Projects, Technical Skills.
- Keyword-rich content aligned with job description.
- Simple bullet structure - one idea per bullet.
- Return the same JSON structure. Return valid JSON only."""

STEP3_USER = """Job Description:
{job_description}

Resume content to make ATS-compliant:
{content_json}

Fix any ATS issues. Return JSON only."""

STEP4_SYSTEM = """You are a resume editor. Trim content to fit exactly within page limits.

RULES:
- Max {max_bullets_per_experience} bullets per experience.
- Max {max_projects} projects.
- Max {max_educations} education entries.
- Condense without losing impact. Merge related bullets if needed.
- Return valid JSON with keys: education, experience, projects, skills.
- Preserve the exact structure."""

STEP4_USER = """Trim this resume content to fit one page:
{content_json}

Apply the limits strictly. Return JSON only."""


def run_pipeline(
    profile_snapshot: Dict,
    job_description: str,
    page_count: int,
    include_projects: bool,
    include_skills: bool,
) -> Dict:
    """
    Run the 4-step LangChain pipeline: select, refine, ATS check, one-page trim.
    """
    limits = PAGE_COUNT_LIMITS.get(page_count, PAGE_COUNT_LIMITS[3])
    max_bullets = limits.get("max_bullets_per_experience", 3)
    max_projects = limits.get("max_projects", 2)
    max_educations = limits.get("max_educations") or 1

    llm = _get_llm()
    parser = JsonOutputParser()

    profile_flat = _transform_profile_to_flat(profile_snapshot)
    profile_json = json.dumps(profile_flat, indent=2)

    # Step 1: Content Selection
    prompt1 = ChatPromptTemplate.from_messages([
        ("system", STEP1_SYSTEM),
        ("human", STEP1_USER),
    ])
    chain1 = prompt1 | llm | parser
    step1_output = chain1.invoke({
        "job_description": job_description,
        "profile_json": profile_json,
        "include_projects": str(include_projects),
        "include_skills": str(include_skills),
    })

    # Step 2: Refinement
    prompt2 = ChatPromptTemplate.from_messages([
        ("system", STEP2_SYSTEM),
        ("human", STEP2_USER),
    ])
    chain2 = prompt2 | llm | parser
    step2_output = chain2.invoke({
        "job_description": job_description,
        "content_json": json.dumps(step1_output, indent=2),
    })

    # Step 3: ATS Check
    prompt3 = ChatPromptTemplate.from_messages([
        ("system", STEP3_SYSTEM),
        ("human", STEP3_USER),
    ])
    chain3 = prompt3 | llm | parser
    step3_output = chain3.invoke({
        "job_description": job_description,
        "content_json": json.dumps(step2_output, indent=2),
    })

    # Step 4: One-Page Trim (when page_count=1, apply strict limits)
    prompt4 = ChatPromptTemplate.from_messages([
        ("system", STEP4_SYSTEM),
        ("human", STEP4_USER),
    ])
    chain4 = prompt4 | llm | parser
    step4_output = chain4.invoke({
        "content_json": json.dumps(step3_output, indent=2),
        "max_bullets_per_experience": max_bullets,
        "max_projects": max_projects,
        "max_educations": max_educations,
    })

    # Ensure output matches template schema
    return _ensure_output_schema(step4_output, include_projects, include_skills)
