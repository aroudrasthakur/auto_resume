"""Profile service for CRUD operations."""

from typing import List, Optional
from uuid import UUID

from supabase import Client

from shared.app.schemas.profile import (
    ContactCreate,
    ContactResponse,
    ProfileCreate,
    ProfileResponse,
    ProfileUpdate,
)
from shared.app.utils.encryption import decrypt_contact, encrypt_contact


class ProfileService:
    """Service for profile operations."""

    def __init__(self, supabase: Client, user_id: str):
        """Initialize service with Supabase client and user ID."""
        self.supabase = supabase
        self.user_id = user_id

    async def create_profile(self, data: ProfileCreate) -> ProfileResponse:
        """Create a new profile."""
        # Insert profile
        profile_result = (
            self.supabase.table("profile")
            .insert(
                {
                    "user_id": self.user_id,
                    "name": data.name,
                    "headline": data.headline,
                    "summary": data.summary,
                    "location": data.location,
                }
            )
            .execute()
        )

        if not profile_result.data:
            raise ValueError("Failed to create profile")

        profile_id = profile_result.data[0]["id"]

        # Insert contacts with encryption
        contacts = []
        for contact in data.contacts:
            ciphertext, nonce, auth_tag, key_version = encrypt_contact(contact.value)
            contact_result = (
                self.supabase.table("profile_contact")
                .insert(
                    {
                        "profile_id": profile_id,
                        "user_id": self.user_id,
                        "contact_kind": contact.contact_kind,
                        "label": contact.label,
                        "ciphertext": ciphertext.hex(),
                        "nonce": nonce.hex(),
                        "auth_tag": auth_tag.hex(),
                        "key_version": key_version,
                    }
                )
                .execute()
            )
            if contact_result.data:
                contacts.append(contact_result.data[0])

        # Fetch complete profile
        return await self.get_profile(profile_id)

    async def get_profile(self, profile_id: UUID) -> Optional[ProfileResponse]:
        """Get a profile by ID."""
        result = (
            self.supabase.table("profile")
            .select("*")
            .eq("id", str(profile_id))
            .eq("user_id", self.user_id)
            .execute()
        )

        if not result.data:
            return None

        profile_data = result.data[0]

        # Get contacts and decrypt
        contacts_result = (
            self.supabase.table("profile_contact")
            .select("*")
            .eq("profile_id", str(profile_id))
            .eq("user_id", self.user_id)
            .execute()
        )

        contacts = []
        for contact_data in contacts_result.data:
            try:
                ciphertext = bytes.fromhex(contact_data["ciphertext"])
                nonce = bytes.fromhex(contact_data["nonce"])
                auth_tag = bytes.fromhex(contact_data["auth_tag"])
                value = decrypt_contact(
                    ciphertext, nonce, auth_tag, contact_data["key_version"]
                )
                contacts.append(
                    ContactResponse(
                        id=contact_data["id"],
                        contact_kind=contact_data["contact_kind"],
                        label=contact_data.get("label"),
                        value=value,
                    )
                )
            except Exception:
                # Skip invalid contacts
                continue

        return ProfileResponse(
            id=profile_data["id"],
            user_id=profile_data["user_id"],
            name=profile_data["name"],
            headline=profile_data.get("headline"),
            summary=profile_data.get("summary"),
            location=profile_data.get("location"),
            contacts=contacts,
            created_at=profile_data["created_at"],
            updated_at=profile_data["updated_at"],
        )

    async def list_profiles(self) -> List[ProfileResponse]:
        """List all profiles for the user."""
        result = (
            self.supabase.table("profile")
            .select("*")
            .eq("user_id", self.user_id)
            .execute()
        )

        profiles = []
        for profile_data in result.data:
            profile = await self.get_profile(profile_data["id"])
            if profile:
                profiles.append(profile)

        return profiles

    async def update_profile(
        self, profile_id: UUID, data: ProfileUpdate
    ) -> Optional[ProfileResponse]:
        """Update a profile."""
        update_data = {}
        if data.name is not None:
            update_data["name"] = data.name
        if data.headline is not None:
            update_data["headline"] = data.headline
        if data.summary is not None:
            update_data["summary"] = data.summary
        if data.location is not None:
            update_data["location"] = data.location

        if update_data:
            self.supabase.table("profile").update(update_data).eq(
                "id", str(profile_id)
            ).eq("user_id", self.user_id).execute()

        # Update contacts if provided
        if data.contacts is not None:
            # Delete existing contacts
            self.supabase.table("profile_contact").delete().eq(
                "profile_id", str(profile_id)
            ).eq("user_id", self.user_id).execute()

            # Insert new contacts
            for contact in data.contacts:
                ciphertext, nonce, auth_tag, key_version = encrypt_contact(
                    contact.value
                )
                self.supabase.table("profile_contact").insert(
                    {
                        "profile_id": str(profile_id),
                        "user_id": self.user_id,
                        "contact_kind": contact.contact_kind,
                        "label": contact.label,
                        "ciphertext": ciphertext.hex(),
                        "nonce": nonce.hex(),
                        "auth_tag": auth_tag.hex(),
                        "key_version": key_version,
                    }
                ).execute()

        return await self.get_profile(profile_id)

    async def delete_profile(self, profile_id: UUID) -> bool:
        """Delete a profile."""
        result = (
            self.supabase.table("profile")
            .delete()
            .eq("id", str(profile_id))
            .eq("user_id", self.user_id)
            .execute()
        )
        return len(result.data) > 0

