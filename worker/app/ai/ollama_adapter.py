"""Ollama adapter for local AI models."""

import json
from typing import Dict

import httpx

from app.ai.provider import AIProvider
from app.core.config import settings


class OllamaAdapter(AIProvider):
    """Ollama adapter for local models."""

    def __init__(self):
        """Initialize Ollama client."""
        self.url = settings.OLLAMA_URL
        self.model = "llama3"

    def generate_content(
        self,
        profile_snapshot: Dict,
        job_description: str,
        page_count: int,
        include_projects: bool,
        include_skills: bool,
    ) -> Dict:
        """Generate resume content using Ollama."""
        prompt = f"""Generate resume content from this profile:
{json.dumps(profile_snapshot, indent=2)}

Job description: {job_description}
Page count: {page_count}

Return JSON only."""

        with httpx.Client() as client:
            response = client.post(
                f"{self.url}/api/generate",
                json={"model": self.model, "prompt": prompt, "stream": False},
                timeout=60.0,
            )
            response.raise_for_status()
            result = response.json()
            content = result.get("response", "{}")
            return json.loads(content)

    def get_provider_name(self) -> str:
        """Get provider name."""
        return "ollama"

