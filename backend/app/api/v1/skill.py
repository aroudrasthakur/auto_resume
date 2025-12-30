"""Skill CRUD endpoints."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.auth.dependencies import get_current_user
from app.core.db import get_supabase_client

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/categories", status_code=status.HTTP_201_CREATED)
@limiter.limit("100/minute")
async def create_skill_category(
    request: Request,
    category_data: dict,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """Create skill category."""
    data = category_data.copy()
    data["user_id"] = current_user["user_id"]
    result = supabase.table("skill_category").insert(data).execute()
    return result.data[0] if result.data else None


@router.get("/categories", response_model=List[dict])
@limiter.limit("100/minute")
async def list_skill_categories(
    request: Request,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """List all skill categories."""
    result = (
        supabase.table("skill_category")
        .select("*, skill_item(*)")
        .eq("user_id", current_user["user_id"])
        .order("sort_order")
        .execute()
    )
    return result.data or []


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("100/minute")
async def delete_skill_category(
    request: Request,
    category_id: UUID,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """Delete skill category."""
    result = (
        supabase.table("skill_category")
        .delete()
        .eq("id", str(category_id))
        .eq("user_id", current_user["user_id"])
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Category not found")

