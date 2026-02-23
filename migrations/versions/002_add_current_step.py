"""Add current_step to generated_resume

Revision ID: 002_add_current_step
Revises: 001_initial
Create Date: 2024-01-02 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "002_add_current_step"
down_revision = "001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "generated_resume",
        sa.Column("current_step", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("generated_resume", "current_step")
