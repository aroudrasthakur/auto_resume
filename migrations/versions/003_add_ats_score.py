"""Add ats_score and ats_feedback to generated_resume

Revision ID: 003_add_ats_score
Revises: 002_add_current_step
Create Date: 2024-01-03 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "003_add_ats_score"
down_revision = "002_add_current_step"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "generated_resume",
        sa.Column("ats_score", sa.Integer(), nullable=True),
    )
    op.add_column(
        "generated_resume",
        sa.Column("ats_feedback", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("generated_resume", "ats_feedback")
    op.drop_column("generated_resume", "ats_score")
