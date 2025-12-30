"""Constants and enums for the application."""

from enum import Enum


class GenerationStatus(str, Enum):
    """Status of resume generation."""

    QUEUED = "QUEUED"
    RUNNING = "RUNNING"
    DONE = "DONE"
    FAILED = "FAILED"


class FileType(str, Enum):
    """Type of generated file."""

    LATEX = "LATEX"
    PDF = "PDF"
    DOCX = "DOCX"


class ContactKind(str, Enum):
    """Type of contact information."""

    EMAIL = "email"
    PHONE = "phone"
    ADDRESS = "address"
    LINKEDIN = "linkedin"
    GITHUB = "github"
    WEBSITE = "website"
    OTHER = "other"


# Page count limits for AI content selection
PAGE_COUNT_LIMITS = {
    1: {
        "max_bullets_per_experience": 3,
        "max_projects": 2,
        "max_educations": 1,
    },
    2: {
        "max_bullets_per_experience": 5,
        "max_projects": 4,
        "max_educations": 2,
    },
    3: {
        "max_bullets_per_experience": 7,
        "max_projects": 6,
        "max_educations": None,  # All educations
    },
}

