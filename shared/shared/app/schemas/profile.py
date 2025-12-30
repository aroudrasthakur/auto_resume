"""Profile schemas."""

from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ContactCreate(BaseModel):
    """Contact information to create."""

    contact_kind: str = Field(..., description="Type of contact")
    label: Optional[str] = None
    value: str = Field(..., description="Contact value (will be encrypted)")


class ContactResponse(BaseModel):
    """Contact information response (decrypted)."""

    id: UUID
    contact_kind: str
    label: Optional[str] = None
    value: str  # Decrypted


class ProfileCreate(BaseModel):
    """Profile creation schema."""

    name: str
    headline: Optional[str] = None
    summary: Optional[str] = None
    location: Optional[str] = None
    contacts: List[ContactCreate] = Field(default_factory=list)


class ProfileUpdate(BaseModel):
    """Profile update schema."""

    name: Optional[str] = None
    headline: Optional[str] = None
    summary: Optional[str] = None
    location: Optional[str] = None
    contacts: Optional[List[ContactCreate]] = None


class ProfileResponse(BaseModel):
    """Profile response schema."""

    id: UUID
    user_id: UUID
    name: str
    headline: Optional[str] = None
    summary: Optional[str] = None
    location: Optional[str] = None
    contacts: List[ContactResponse] = Field(default_factory=list)
    created_at: str
    updated_at: str

