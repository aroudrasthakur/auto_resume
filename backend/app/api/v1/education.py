"""Education CRUD endpoints."""

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
async def create_education(
    request: Request,
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
    request: Request,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """List all education entries with highlights."""
    result = (
        supabase.table("education")
        .select("*, education_highlight(*)")
        .eq("user_id", current_user["user_id"])
        .order("start_date", desc=True)
        .execute()
    )
    return result.data or []


@router.post("/{education_id}/highlights", status_code=status.HTTP_201_CREATED)
@limiter.limit("100/minute")
async def add_education_highlights(
    request: Request,
    education_id: UUID,
    highlights_data: dict,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """Add highlights to an education entry."""
    edu_result = (
        supabase.table("education")
        .select("id")
        .eq("id", str(education_id))
        .eq("user_id", current_user["user_id"])
        .execute()
    )
    if not edu_result.data:
        raise HTTPException(status_code=404, detail="Education not found")

    highlights = highlights_data.get("highlights", [])
    if not highlights:
        return {"added": 0}

    rows = []
    for i, text in enumerate(highlights):
        if text and str(text).strip():
            rows.append(
                {
                    "education_id": str(education_id),
                    "user_id": current_user["user_id"],
                    "highlight": str(text).strip(),
                    "sort_order": i,
                }
            )

    if not rows:
        return {"added": 0}

    result = supabase.table("education_highlight").insert(rows).execute()
    return {"added": len(result.data or [])}


@router.get("/{education_id}")
@limiter.limit("100/minute")
async def get_education(
    request: Request,
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
    request: Request,
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
    request: Request,
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
