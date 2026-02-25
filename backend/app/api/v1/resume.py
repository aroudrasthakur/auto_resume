"""Resume generation endpoints."""

import json
from pathlib import Path
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import FileResponse
from shared.app.schemas.resume_request import ResumeGenerateRequest, ResumeGenerateResponse
from shared.app.utils.compress import compress_text, pack_profile_snapshot
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.auth.dependencies import get_current_user
from app.core.config import settings, use_local_storage
from app.core.db import get_supabase_client
from app.services.profile import ProfileService

# Import Celery app (will be available at runtime)
try:
    from worker.app.celery_app import celery_app
except ImportError:
    celery_app = None

_project_root = Path(__file__).resolve().parents[4]

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
        raise HTTPException(status_code=400, detail="Job description text or ID required")

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
        raise HTTPException(status_code=500, detail="Failed to create resume generation record")

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
    use_local = use_local_storage()

    for file in files:
        storage_key = file["storage_key"]
        if use_local:
            # Local storage: return API URL to stream file
            base = str(request.base_url).rstrip("/")
            file["download_url"] = f"{base}/api/v1/resumes/{resume_id}/files/{file['id']}/download"
        else:
            url_result = supabase.storage.from_("generated-resumes").create_signed_url(
                storage_key, 3600
            )
            file["download_url"] = url_result.get("signedURL")

    return files


@router.get("/{resume_id}/files/{file_id}/download")
@limiter.limit("100/minute")
async def download_resume_file(
    request: Request,
    resume_id: UUID,
    file_id: UUID,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """Stream file from local storage (only when local storage is enabled)."""
    if not use_local_storage():
        raise HTTPException(status_code=404, detail="Not found")

    resume_result = (
        supabase.table("generated_resume")
        .select("*")
        .eq("id", str(resume_id))
        .eq("user_id", current_user["user_id"])
        .execute()
    )
    if not resume_result.data:
        raise HTTPException(status_code=404, detail="Resume not found")

    file_result = (
        supabase.table("generated_file")
        .select("*")
        .eq("id", str(file_id))
        .eq("generated_resume_id", str(resume_id))
        .execute()
    )
    if not file_result.data:
        raise HTTPException(status_code=404, detail="File not found")

    storage_key = file_result.data[0]["storage_key"]
    local_dir = (settings.STORAGE_LOCAL_DIR or "").strip()
    base = Path(local_dir)
    if not base.is_absolute():
        base = _project_root / base
    local_path = base / Path(*storage_key.split("/"))
    if not local_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    mime = file_result.data[0].get("mime_type", "application/octet-stream")
    return FileResponse(local_path, media_type=mime, filename=local_path.name)


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
        .select(
            "id, user_id, profile_id, job_description_id, template_id, status, page_count, include_projects, include_skills, created_at, updated_at, failure_reason, profile(name)"
        )
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
