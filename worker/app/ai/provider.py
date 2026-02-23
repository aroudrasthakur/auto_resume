"""AI provider interface and factory."""

import os
from abc import ABC, abstractmethod
from typing import Callable, Dict, Optional

from app.core.config import settings


class AIProvider(ABC):
    """Abstract base class for AI providers."""

    @abstractmethod
    def generate_content(
        self,
        profile_snapshot: Dict,
        job_description: str,
        page_count: int,
        include_projects: bool,
        include_skills: bool,
        update_step: Optional[Callable[[str], None]] = None,
    ) -> Dict:
        """Generate resume content. update_step is called with current step name for live status."""
        pass

    @abstractmethod
    def get_provider_name(self) -> str:
        """Get provider name."""
        pass


def get_ai_provider() -> AIProvider:
    """Get AI provider based on configuration."""
    # Import adapters here to avoid circular imports
    from app.ai.mock_adapter import MockAdapter
    from app.ai.ollama_adapter import OllamaAdapter
    from app.ai.openai_adapter import OpenAIAdapter

    provider = os.getenv("AI_PROVIDER", settings.AI_PROVIDER).lower()

    if provider == "mock":
        return MockAdapter()
    elif provider == "openai":
        return OpenAIAdapter()
    elif provider == "ollama":
        return OllamaAdapter()
    else:
        raise ValueError(f"Unknown AI provider: {provider}")
