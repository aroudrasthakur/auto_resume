"""Project CRUD endpoints."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.auth.dependencies import get_current_user
from app.core.db import get_supabase_client

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("", status_code=status.HTTP_201_CREATED)
@limiter.limit("100/minute")
async def create_project(
    project_data: dict,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """Create project entry."""
    data = project_data.copy()
    data["user_id"] = current_user["user_id"]
    result = supabase.table("project").insert(data).execute()
    return result.data[0] if result.data else None


@router.get("", response_model=List[dict])
@limiter.limit("100/minute")
async def list_projects(
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """List all projects."""
    result = (
        supabase.table("project")
        .select("*")
        .eq("user_id", current_user["user_id"])
        .execute()
    )
    return result.data or []


@router.get("/{project_id}")
@limiter.limit("100/minute")
async def get_project(
    project_id: UUID,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """Get project entry."""
    result = (
        supabase.table("project")
        .select("*")
        .eq("id", str(project_id))
        .eq("user_id", current_user["user_id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Project not found")
    return result.data[0]


@router.put("/{project_id}")
@limiter.limit("100/minute")
async def update_project(
    project_id: UUID,
    project_data: dict,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """Update project entry."""
    result = (
        supabase.table("project")
        .update(project_data)
        .eq("id", str(project_id))
        .eq("user_id", current_user["user_id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Project not found")
    return result.data[0]


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("100/minute")
async def delete_project(
    project_id: UUID,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """Delete project entry."""
    result = (
        supabase.table("project")
        .delete()
        .eq("id", str(project_id))
        .eq("user_id", current_user["user_id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Project not found")

