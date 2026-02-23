"""OpenAI adapter for AI content generation."""

from typing import Dict

from app.ai.langchain_pipeline import run_pipeline
from app.ai.provider import AIProvider


class OpenAIAdapter(AIProvider):
    """OpenAI adapter using LangChain multi-step pipeline."""

    def __init__(self):
        """Initialize adapter (uses LangChain pipeline with OpenAI)."""
        pass

    def generate_content(
        self,
        profile_snapshot: Dict,
        job_description: str,
        page_count: int,
        include_projects: bool,
        include_skills: bool,
    ) -> Dict:
        """Generate resume content using LangChain 4-step pipeline."""
        return run_pipeline(
            profile_snapshot=profile_snapshot,
            job_description=job_description,
            page_count=page_count,
            include_projects=include_projects,
            include_skills=include_skills,
        )

    def get_provider_name(self) -> str:
        """Get provider name."""
        return "openai"

