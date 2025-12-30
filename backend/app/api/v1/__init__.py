"""API v1 routes."""

from fastapi import APIRouter

from app.api.v1 import (
    education,
    experience,
    job_description,
    profile,
    project,
    resume,
    skill,
)

api_router = APIRouter()

api_router.include_router(profile.router, prefix="/profiles", tags=["profiles"])
api_router.include_router(education.router, prefix="/education", tags=["education"])
api_router.include_router(
    experience.router, prefix="/experience", tags=["experience"]
)
api_router.include_router(project.router, prefix="/projects", tags=["projects"])
api_router.include_router(skill.router, prefix="/skills", tags=["skills"])
api_router.include_router(
    job_description.router, prefix="/job-descriptions", tags=["job-descriptions"]
)
api_router.include_router(resume.router, prefix="/resumes", tags=["resumes"])

