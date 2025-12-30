"""Experience CRUD endpoints."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.auth.dependencies import get_current_user
from app.core.db import get_supabase_client

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("", status_code=status.HTTP_201_CREATED)
@limiter.limit("100/minute")
async def create_experience(
    request: Request,
    experience_data: dict,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """Create experience entry."""
    data = experience_data.copy()
    data["user_id"] = current_user["user_id"]
    result = supabase.table("experience").insert(data).execute()
    return result.data[0] if result.data else None


@router.get("", response_model=List[dict])
@limiter.limit("100/minute")
async def list_experience(
    request: Request,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """List all experience entries."""
    result = (
        supabase.table("experience")
        .select("*")
        .eq("user_id", current_user["user_id"])
        .order("start_date", desc=True)
        .execute()
    )
    return result.data or []


@router.get("/{experience_id}")
@limiter.limit("100/minute")
async def get_experience(
    request: Request,
    experience_id: UUID,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """Get experience entry."""
    result = (
        supabase.table("experience")
        .select("*")
        .eq("id", str(experience_id))
        .eq("user_id", current_user["user_id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Experience not found")
    return result.data[0]


@router.put("/{experience_id}")
@limiter.limit("100/minute")
async def update_experience(
    request: Request,
    experience_id: UUID,
    experience_data: dict,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """Update experience entry."""
    result = (
        supabase.table("experience")
        .update(experience_data)
        .eq("id", str(experience_id))
        .eq("user_id", current_user["user_id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Experience not found")
    return result.data[0]


@router.delete("/{experience_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("100/minute")
async def delete_experience(
    request: Request,
    experience_id: UUID,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """Delete experience entry."""
    result = (
        supabase.table("experience")
        .delete()
        .eq("id", str(experience_id))
        .eq("user_id", current_user["user_id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Experience not found")

