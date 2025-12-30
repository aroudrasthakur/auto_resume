"""Profile CRUD endpoints."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.auth.dependencies import get_current_user
from app.core.db import get_supabase_client
from app.services.profile import ProfileService
from shared.app.schemas.profile import (
    ProfileCreate,
    ProfileResponse,
    ProfileUpdate,
)

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("100/minute")
async def create_profile(
    profile_data: ProfileCreate,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """Create a new profile."""
    service = ProfileService(supabase, current_user["user_id"])
    return await service.create_profile(profile_data)


@router.get("/{profile_id}", response_model=ProfileResponse)
@limiter.limit("100/minute")
async def get_profile(
    profile_id: UUID,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """Get a profile by ID."""
    service = ProfileService(supabase, current_user["user_id"])
    profile = await service.get_profile(profile_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found"
        )
    return profile


@router.get("", response_model=List[ProfileResponse])
@limiter.limit("100/minute")
async def list_profiles(
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """List all profiles for the current user."""
    service = ProfileService(supabase, current_user["user_id"])
    return await service.list_profiles()


@router.put("/{profile_id}", response_model=ProfileResponse)
@limiter.limit("100/minute")
async def update_profile(
    profile_id: UUID,
    profile_data: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """Update a profile."""
    service = ProfileService(supabase, current_user["user_id"])
    profile = await service.update_profile(profile_id, profile_data)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found"
        )
    return profile


@router.delete("/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("100/minute")
async def delete_profile(
    profile_id: UUID,
    current_user: dict = Depends(get_current_user),
    supabase=Depends(get_supabase_client),
):
    """Delete a profile."""
    service = ProfileService(supabase, current_user["user_id"])
    success = await service.delete_profile(profile_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found"
        )

