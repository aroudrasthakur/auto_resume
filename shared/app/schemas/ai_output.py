"""Schema for AI-generated resume content."""

from typing import List, Optional

from pydantic import BaseModel, Field


class AIOutputEducation(BaseModel):
    """Selected education entry."""

    id: str = Field(..., description="Original education ID")
    school: str
    degree: Optional[str] = None
    major: Optional[str] = None
    gpa: Optional[str] = None
    start_date: Optional[str] = None  # ISO date string
    end_date: Optional[str] = None
    location: Optional[str] = None
    highlights: List[str] = Field(default_factory=list)


class AIOutputExperienceBullet(BaseModel):
    """Rewritten experience bullet point."""

    original_id: Optional[str] = Field(None, description="Original bullet ID if available")
    bullet: str = Field(..., description="Rewritten bullet point text")
    priority: int = Field(default=0, description="Priority score (higher = more relevant)")


class AIOutputExperience(BaseModel):
    """Selected experience entry."""

    id: str = Field(..., description="Original experience ID")
    company: str
    role: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    bullets: List[AIOutputExperienceBullet] = Field(default_factory=list)


class AIOutputProjectBullet(BaseModel):
    """Rewritten project bullet point."""

    original_id: Optional[str] = None
    bullet: str
    priority: int = Field(default=0)


class AIOutputProject(BaseModel):
    """Selected project entry."""

    id: str = Field(..., description="Original project ID")
    name: str
    role: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    bullets: List[AIOutputProjectBullet] = Field(default_factory=list)
    technologies: List[str] = Field(default_factory=list)


class AIOutputSkills(BaseModel):
    """Selected skills."""

    categories: List[dict] = Field(
        default_factory=list,
        description="List of skill categories with items",
    )


class AIOutput(BaseModel):
    """Complete AI output schema."""

    education: List[AIOutputEducation] = Field(default_factory=list)
    experience: List[AIOutputExperience] = Field(default_factory=list)
    projects: List[AIOutputProject] = Field(default_factory=list)
    skills: Optional[AIOutputSkills] = None

