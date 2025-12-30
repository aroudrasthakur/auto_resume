"""Resume generation endpoints."""

import json
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.auth.dependencies import get_current_user
from app.core.config import settings
from app.core.db import get_supabase_client
from app.services.profile import ProfileService
from shared.app.schemas.resume_request import (
    ResumeGenerateRequest,
    ResumeGenerateResponse,
)

# Import Celery app (will be available at runtime)
try:
    from worker.app.celery_app import celery_app
except ImportError:
    # Fallback for when worker is not installed
    celery_app = None

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/generate", response_model=ResumeGenerateResponse)
@limiter.limit(f"{settings.RATE_LIMIT_GENERATE_PER_HOUR}/hour")
async def generate_resume(
    request: ResumeGenerateRequest,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """
    Generate a resume.

    Creates a snapshot of profile data and enqueues generation task.
    """
    user_id = current_user["user_id"]

    # Get profile and all related data
    profile_service = ProfileService(supabase, user_id)
    profile = await profile_service.get_profile(UUID(request.profile_id))
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Get job description
    jd_text = request.job_description_text
    jd_id = request.job_description_id

    if jd_id:
        jd_result = (
            supabase.table("job_description")
            .select("*")
            .eq("id", str(jd_id))
            .eq("user_id", user_id)
            .execute()
        )
        if not jd_result.data:
            raise HTTPException(status_code=404, detail="Job description not found")
        jd_text = jd_result.data[0]["raw_text"]

    if not jd_text:
        raise HTTPException(
            status_code=400, detail="Job description text or ID required"
        )

    # Get template
    template_result = (
        supabase.table("resume_template")
        .select("*")
        .eq("name", request.template_id)
        .execute()
    )
    if not template_result.data:
        raise HTTPException(status_code=404, detail="Template not found")
    template_id = template_result.data[0]["id"]

    # Snapshot profile data (get all related entities)
    profile_snapshot = {
        "profile": profile.dict(),
        "education": (
            supabase.table("education")
            .select("*, education_highlight(*)")
            .eq("profile_id", request.profile_id)
            .execute()
        ).data,
        "experience": (
            supabase.table("experience")
            .select("*, experience_bullet(*)")
            .eq("profile_id", request.profile_id)
            .execute()
        ).data,
        "projects": (
            supabase.table("project")
            .select("*, project_bullet(*), project_link(*), project_tech(*)")
            .eq("profile_id", request.profile_id)
            .execute()
        ).data,
        "skills": (
            supabase.table("skill_category")
            .select("*, skill_item(*)")
            .eq("profile_id", request.profile_id)
            .execute()
        ).data,
    }

    # Create generated_resume record
    gen_resume_result = (
        supabase.table("generated_resume")
        .insert(
            {
                "user_id": user_id,
                "profile_id": request.profile_id,
                "job_description_id": str(jd_id) if jd_id else None,
                "template_id": str(template_id),
                "status": "QUEUED",
                "page_count": request.page_count,
                "include_projects": request.include_projects,
                "include_skills": request.include_skills,
                "profile_snapshot": json.dumps(profile_snapshot),
                "jd_snapshot": jd_text,
            }
        )
        .execute()
    )

    if not gen_resume_result.data:
        raise HTTPException(
            status_code=500, detail="Failed to create resume generation record"
        )

    generated_resume_id = gen_resume_result.data[0]["id"]

    # Enqueue Celery task
    if celery_app:
        celery_app.send_task(
            "worker.app.tasks.generate_resume.generate_resume",
            args=[str(generated_resume_id)],
        )
    else:
        # Fallback: could use Redis directly or raise error
        raise HTTPException(
            status_code=500, detail="Worker not available"
        )

    return ResumeGenerateResponse(
        generated_resume_id=str(generated_resume_id),
        status="QUEUED",
        message="Resume generation queued",
    )


@router.get("/{resume_id}")
@limiter.limit("100/minute")
async def get_resume_status(
    resume_id: UUID,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """Get resume generation status."""
    result = (
        supabase.table("generated_resume")
        .select("*")
        .eq("id", str(resume_id))
        .eq("user_id", current_user["user_id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Resume not found")
    return result.data[0]


@router.get("/{resume_id}/files", response_model=List[dict])
@limiter.limit("100/minute")
async def get_resume_files(
    resume_id: UUID,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """Get generated files with presigned download URLs."""
    # Verify resume ownership
    resume_result = (
        supabase.table("generated_resume")
        .select("*")
        .eq("id", str(resume_id))
        .eq("user_id", current_user["user_id"])
        .execute()
    )
    if not resume_result.data:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Get files
    files_result = (
        supabase.table("generated_file")
        .select("*")
        .eq("generated_resume_id", str(resume_id))
        .execute()
    )

    files = files_result.data or []

    # Generate presigned URLs
    for file in files:
        storage_key = file["storage_key"]
        # Generate presigned URL (valid for 1 hour)
        url_result = (
            supabase.storage.from_("generated-resumes")
            .create_signed_url(storage_key, 3600)
        )
        file["download_url"] = url_result.get("signedURL")

    return files


@router.get("", response_model=List[dict])
@limiter.limit("100/minute")
async def list_resumes(
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """List user's generated resumes."""
    result = (
        supabase.table("generated_resume")
        .select("*")
        .eq("user_id", current_user["user_id"])
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []

