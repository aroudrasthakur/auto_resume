"""Mock AI adapter for testing."""

from typing import Dict

from app.ai.provider import AIProvider
from shared.app.constants import PAGE_COUNT_LIMITS


class MockAdapter(AIProvider):
    """Mock AI adapter that returns deterministic JSON."""

    def generate_content(
        self,
        profile_snapshot: Dict,
        job_description: str,
        page_count: int,
        include_projects: bool,
        include_skills: bool,
    ) -> Dict:
        """Generate mock resume content."""
        limits = PAGE_COUNT_LIMITS.get(page_count, PAGE_COUNT_LIMITS[3])

        # Select first N items based on page count
        education = profile_snapshot.get("education", [])[: limits.get("max_educations") or 999]
        experience = profile_snapshot.get("experience", [])
        projects = profile_snapshot.get("projects", [])[: limits.get("max_projects", 999)]

        # Limit bullets per experience
        max_bullets = limits.get("max_bullets_per_experience", 999)
        for exp in experience:
            bullets = exp.get("experience_bullet", [])
            if len(bullets) > max_bullets:
                exp["experience_bullet"] = bullets[:max_bullets]

        return {
            "education": education,
            "experience": experience,
            "projects": projects if include_projects else [],
            "skills": profile_snapshot.get("skills", []) if include_skills else [],
        }

    def get_provider_name(self) -> str:
        """Get provider name."""
        return "mock"

