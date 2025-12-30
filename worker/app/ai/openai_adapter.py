"""OpenAI adapter for AI content generation."""

import json
from typing import Dict

from openai import OpenAI

from app.ai.provider import AIProvider
from app.core.config import settings
from shared.app.constants import PAGE_COUNT_LIMITS


class OpenAIAdapter(AIProvider):
    """OpenAI adapter using GPT-4."""

    def __init__(self):
        """Initialize OpenAI client."""
        api_key = settings.OPENAI_API_KEY
        if not api_key:
            raise ValueError("OPENAI_API_KEY is required")
        self.client = OpenAI(api_key=api_key)
        self.model = "gpt-4o"

    def generate_content(
        self,
        profile_snapshot: Dict,
        job_description: str,
        page_count: int,
        include_projects: bool,
        include_skills: bool,
    ) -> Dict:
        """Generate resume content using OpenAI."""
        limits = PAGE_COUNT_LIMITS.get(page_count, PAGE_COUNT_LIMITS[3])

        system_prompt = """You are a resume content selector and optimizer.
ONLY use content from the provided profile.
DO NOT invent companies, dates, degrees, or accomplishments.
Return valid JSON matching the schema.
Prioritize content most relevant to the job description."""

        user_prompt = f"""Job Description:
{job_description}

Profile Data:
{json.dumps(profile_snapshot, indent=2)}

Page Count: {page_count}
Max bullets per experience: {limits.get('max_bullets_per_experience', 999)}
Max projects: {limits.get('max_projects', 999)}
Include projects: {include_projects}
Include skills: {include_skills}

Select and optimize content to fit within these constraints."""

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
        )

        content = response.choices[0].message.content
        return json.loads(content)

    def get_provider_name(self) -> str:
        """Get provider name."""
        return "openai"

