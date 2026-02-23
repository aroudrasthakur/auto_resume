"""Resume generation endpoints."""

import json
from typing import List
from uuid import UUID

from shared.app.utils.compress import compress_text, pack_profile_snapshot

from fastapi import APIRouter, Depends, HTTPException, Request, status
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
    request: Request,
    generate_request: ResumeGenerateRequest,
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
    profile = await profile_service.get_profile(UUID(generate_request.profile_id))
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Check profile completeness before generating
    completeness = profile_service.check_completeness(UUID(generate_request.profile_id))
    if not completeness.is_complete:
        raise HTTPException(
            status_code=400,
            detail={
                "detail": "Profile not set up. Please add your information, experience, and education before generating a resume.",
                "code": "PROFILE_INCOMPLETE",
                "missing_sections": completeness.missing_sections,
            },
        )

    # Get job description
    jd_text = generate_request.job_description_text
    jd_id = generate_request.job_description_id

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
        .eq("name", generate_request.template_id)
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
            .eq("profile_id", generate_request.profile_id)
            .execute()
        ).data,
        "experience": (
            supabase.table("experience")
            .select("*, experience_bullet(*)")
            .eq("profile_id", generate_request.profile_id)
            .execute()
        ).data,
        "projects": (
            supabase.table("project")
            .select("*, project_bullet(*), project_link(*), project_tech(*)")
            .eq("profile_id", generate_request.profile_id)
            .execute()
        ).data,
        "skills": (
            supabase.table("skill_category")
            .select("*, skill_item(*)")
            .eq("profile_id", generate_request.profile_id)
            .execute()
        ).data,
    }

    # Create generated_resume record
    gen_resume_result = (
        supabase.table("generated_resume")
        .insert(
            {
                "user_id": user_id,
                "profile_id": generate_request.profile_id,
                "job_description_id": str(jd_id) if jd_id else None,
                "template_id": str(template_id),
                "status": "QUEUED",
                "page_count": generate_request.page_count,
                "include_projects": generate_request.include_projects,
                "include_skills": generate_request.include_skills,
                "profile_snapshot": pack_profile_snapshot(profile_snapshot),
                "jd_snapshot": compress_text(jd_text),
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
        try:
            celery_app.send_task(
                "worker.app.tasks.generate_resume.generate_resume",
                args=[str(generated_resume_id)],
            )
        except Exception as e:
            raise HTTPException(
                status_code=503,
                detail=f"Worker not available. Start Redis (docker compose up -d redis) and the Celery worker (cd worker && celery -A app.celery_app worker --loglevel=info). Error: {e}",
            ) from e
    else:
        raise HTTPException(
            status_code=503,
            detail="Worker not available. Start Redis (docker compose up -d redis) and the Celery worker (cd worker && celery -A app.celery_app worker --loglevel=info).",
        )

    return ResumeGenerateResponse(
        generated_resume_id=str(generated_resume_id),
        status="QUEUED",
        message="Resume generation queued",
    )


@router.get("/{resume_id}")
@limiter.limit("100/minute")
async def get_resume_status(
    request: Request,
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
    request: Request,
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


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("100/minute")
async def delete_resume(
    request: Request,
    resume_id: UUID,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """Delete a generated resume (any status including QUEUED/RUNNING)."""
    result = (
        supabase.table("generated_resume")
        .delete()
        .eq("id", str(resume_id))
        .eq("user_id", current_user["user_id"])
        .execute()
    )
    # Supabase delete returns deleted rows; empty means not found or not owned
    if not result.data:
        raise HTTPException(status_code=404, detail="Resume not found")


@router.get("", response_model=List[dict])
@limiter.limit("100/minute")
async def list_resumes(
    request: Request,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """List user's generated resumes with profile name."""
    result = (
        supabase.table("generated_resume")
        .select("id, user_id, profile_id, job_description_id, template_id, status, page_count, include_projects, include_skills, created_at, updated_at, failure_reason, profile(name)")
        .eq("user_id", current_user["user_id"])
        .order("created_at", desc=True)
        .execute()
    )
    # Flatten profile name into resume record
    data = result.data or []
    for r in data:
        prof = r.pop("profile", None)
        if isinstance(prof, dict):
            r["profile_name"] = prof.get("name", "")
        elif isinstance(prof, list) and prof:
            r["profile_name"] = prof[0].get("name", "") if isinstance(prof[0], dict) else ""
        else:
            r["profile_name"] = ""
    return data

