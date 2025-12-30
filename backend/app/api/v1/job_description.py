"""Job description endpoints."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.auth.dependencies import get_current_user
from app.core.db import get_supabase_client
from worker.app.tasks.embeddings import generate_embedding_for_jd

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("", status_code=status.HTTP_201_CREATED)
@limiter.limit("100/minute")
async def create_job_description(
    jd_data: dict,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """Create job description and enqueue embedding generation."""
    data = jd_data.copy()
    data["user_id"] = current_user["user_id"]
    result = supabase.table("job_description").insert(data).execute()
    if result.data:
        jd_id = result.data[0]["id"]
        # Enqueue embedding generation
        background_tasks.add_task(generate_embedding_for_jd, str(jd_id))
        return result.data[0]
    return None


@router.get("", response_model=List[dict])
@limiter.limit("100/minute")
async def list_job_descriptions(
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """List all job descriptions."""
    result = (
        supabase.table("job_description")
        .select("*")
        .eq("user_id", current_user["user_id"])
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


@router.get("/{jd_id}")
@limiter.limit("100/minute")
async def get_job_description(
    jd_id: UUID,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """Get job description."""
    result = (
        supabase.table("job_description")
        .select("*")
        .eq("id", str(jd_id))
        .eq("user_id", current_user["user_id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Job description not found")
    return result.data[0]

