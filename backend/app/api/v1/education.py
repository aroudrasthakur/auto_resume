"""Education CRUD endpoints."""

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
async def create_education(
    education_data: dict,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """Create education entry."""
    data = education_data.copy()
    data["user_id"] = current_user["user_id"]
    result = supabase.table("education").insert(data).execute()
    return result.data[0] if result.data else None


@router.get("", response_model=List[dict])
@limiter.limit("100/minute")
async def list_education(
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """List all education entries."""
    result = (
        supabase.table("education")
        .select("*")
        .eq("user_id", current_user["user_id"])
        .execute()
    )
    return result.data or []


@router.get("/{education_id}")
@limiter.limit("100/minute")
async def get_education(
    education_id: UUID,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """Get education entry."""
    result = (
        supabase.table("education")
        .select("*")
        .eq("id", str(education_id))
        .eq("user_id", current_user["user_id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Education not found")
    return result.data[0]


@router.put("/{education_id}")
@limiter.limit("100/minute")
async def update_education(
    education_id: UUID,
    education_data: dict,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """Update education entry."""
    result = (
        supabase.table("education")
        .update(education_data)
        .eq("id", str(education_id))
        .eq("user_id", current_user["user_id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Education not found")
    return result.data[0]


@router.delete("/{education_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("100/minute")
async def delete_education(
    education_id: UUID,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """Delete education entry."""
    result = (
        supabase.table("education")
        .delete()
        .eq("id", str(education_id))
        .eq("user_id", current_user["user_id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Education not found")

