"""Mock AI adapter for testing."""

from typing import Callable, Dict, Optional

from shared.app.constants import PAGE_COUNT_LIMITS

from app.ai.provider import AIProvider


class MockAdapter(AIProvider):
    """Mock AI adapter that returns deterministic JSON."""

    def generate_content(
        self,
        profile_snapshot: Dict,
        job_description: str,
        page_count: int,
        include_projects: bool,
        include_skills: bool,
        update_step: Optional[Callable[[str], None]] = None,
    ) -> Dict:
        """Generate mock resume content in renderer-compatible format."""
        limits = PAGE_COUNT_LIMITS.get(page_count, PAGE_COUNT_LIMITS[3])
        max_bullets = limits.get("max_bullets_per_experience", 999)

        education_raw = profile_snapshot.get("education", [])[: limits.get("max_educations") or 999]
        education = []
        for edu in education_raw:
            highlights = edu.get("highlights", edu.get("education_highlight", []))
            if highlights and isinstance(highlights[0], dict):
                highlights = [h.get("highlight", h.get("bullet", str(h))) for h in highlights]
            education.append(
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

        experience_raw = profile_snapshot.get("experience", [])
        experience = []
        for exp in experience_raw:
            bullets_raw = exp.get("bullets", exp.get("experience_bullet", []))[:max_bullets]
            bullets = [
                {
                    "bullet": (
                        b.get("bullet", b.get("highlight", str(b)))
                        if isinstance(b, dict)
                        else str(b)
                    )
                }
                for b in bullets_raw
            ]
            experience.append(
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

        projects_raw = profile_snapshot.get("projects", [])[: limits.get("max_projects", 999)]
        projects = []
        if include_projects:
            for proj in projects_raw:
                bullets_raw = proj.get("bullets", proj.get("project_bullet", []))
                bullets = [
                    {"bullet": (b.get("bullet", str(b)) if isinstance(b, dict) else str(b))}
                    for b in bullets_raw
                ]
                tech_raw = proj.get("technologies", proj.get("project_tech", []))
                technologies = [
                    t.get("tech", str(t)) if isinstance(t, dict) else str(t) for t in tech_raw
                ]
                projects.append(
                    {
                        "name": proj.get("name", ""),
                        "start_date": proj.get("start_date"),
                        "end_date": proj.get("end_date"),
                        "role": proj.get("role"),
                        "bullets": bullets,
                        "technologies": technologies,
                    }
                )

        skills_raw = profile_snapshot.get("skills", [])
        skills = {"categories": []}
        if include_skills and isinstance(skills_raw, list):
            for cat in skills_raw:
                if isinstance(cat, dict):
                    items_raw = cat.get("items", cat.get("skill_item", []))
                    items = [
                        i.get("item", str(i)) if isinstance(i, dict) else str(i) for i in items_raw
                    ]
                    skills["categories"].append({"name": cat.get("name", ""), "items": items})

        return {
            "education": education,
            "experience": experience,
            "projects": projects,
            "skills": skills,
        }

    def get_provider_name(self) -> str:
        """Get provider name."""
        return "mock"
