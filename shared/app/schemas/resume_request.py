"""Schemas for resume generation requests."""

from typing import List, Optional

from pydantic import BaseModel, Field


class ResumeGenerateRequest(BaseModel):
    """Request to generate a resume."""

    profile_id: str = Field(..., description="Profile ID to use")
    job_description_id: Optional[str] = Field(
        None, description="Job description ID (or provide raw_text)"
    )
    job_description_text: Optional[str] = Field(
        None, description="Raw job description text (if not using saved JD)"
    )
    template_id: str = Field(default="jakes-resume-ats", description="Template ID")
    page_count: int = Field(default=1, ge=1, le=3, description="Number of pages (1-3)")
    include_projects: bool = Field(default=True, description="Include projects section")
    include_skills: bool = Field(default=True, description="Include skills section")
    outputs: List[str] = Field(
        default_factory=lambda: ["PDF"],
        description="Output formats: PDF, LATEX, DOCX",
    )


class ResumeGenerateResponse(BaseModel):
    """Response from resume generation request."""

    generated_resume_id: str
    status: str = Field(..., description="QUEUED, RUNNING, DONE, FAILED")
    message: Optional[str] = None

