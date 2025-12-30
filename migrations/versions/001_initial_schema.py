"""Initial schema

Revision ID: 001_initial
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from pgvector.sqlalchemy import Vector

# revision identifiers, used by Alembic.
revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Enable pgvector extension
    op.execute('CREATE EXTENSION IF NOT EXISTS vector')

    # Create app_user table
    op.create_table(
        'app_user',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('cognito_sub', sa.Text(), nullable=False),
        sa.Column('email', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.UniqueConstraint('cognito_sub', name='app_user_cognito_sub_key')
    )

    # Create profile table
    op.create_table(
        'profile',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('headline', sa.Text(), nullable=True),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('location', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['app_user.id'], ondelete='CASCADE')
    )
    op.create_index('idx_profile_user', 'profile', ['user_id'])

    # Create profile_contact table
    op.create_table(
        'profile_contact',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('profile_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('contact_kind', sa.Text(), nullable=False),
        sa.Column('label', sa.Text(), nullable=True),
        sa.Column('ciphertext', sa.LargeBinary(), nullable=False),
        sa.Column('nonce', sa.LargeBinary(), nullable=False),
        sa.Column('auth_tag', sa.LargeBinary(), nullable=False),
        sa.Column('key_version', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['profile_id'], ['profile.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['app_user.id'], ondelete='CASCADE')
    )
    op.create_index('idx_profile_contact_profile', 'profile_contact', ['profile_id'])
    op.create_index('idx_profile_contact_user', 'profile_contact', ['user_id'])

    # Create education table
    op.create_table(
        'education',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('profile_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('school', sa.Text(), nullable=False),
        sa.Column('degree', sa.Text(), nullable=True),
        sa.Column('major', sa.Text(), nullable=True),
        sa.Column('gpa', sa.Text(), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('location', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['profile_id'], ['profile.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['app_user.id'], ondelete='CASCADE')
    )
    op.create_index('idx_edu_profile', 'education', ['profile_id'])
    op.create_index('idx_edu_user', 'education', ['user_id'])

    # Create education_highlight table
    op.create_table(
        'education_highlight',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('education_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('highlight', sa.Text(), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['education_id'], ['education.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['app_user.id'], ondelete='CASCADE')
    )

    # Create experience table
    op.create_table(
        'experience',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('profile_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('company', sa.Text(), nullable=False),
        sa.Column('role', sa.Text(), nullable=False),
        sa.Column('location', sa.Text(), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('is_current', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['profile_id'], ['profile.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['app_user.id'], ondelete='CASCADE')
    )
    op.create_index('idx_exp_profile', 'experience', ['profile_id'])
    op.create_index('idx_exp_user', 'experience', ['user_id'])

    # Create experience_bullet table with vector embedding
    op.create_table(
        'experience_bullet',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('experience_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('bullet', sa.Text(), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('embedding', Vector(1536), nullable=True),
        sa.ForeignKeyConstraint(['experience_id'], ['experience.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['app_user.id'], ondelete='CASCADE')
    )
    op.execute("CREATE INDEX idx_exp_bullet_embedding ON experience_bullet USING ivfflat (embedding vector_cosine_ops)")

    # Create project table
    op.create_table(
        'project',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('profile_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('role', sa.Text(), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['profile_id'], ['profile.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['app_user.id'], ondelete='CASCADE')
    )
    op.create_index('idx_proj_profile', 'project', ['profile_id'])
    op.create_index('idx_proj_user', 'project', ['user_id'])

    # Create project_link table
    op.create_table(
        'project_link',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('label', sa.Text(), nullable=True),
        sa.Column('url', sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['project.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['app_user.id'], ondelete='CASCADE')
    )

    # Create project_tech table
    op.create_table(
        'project_tech',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tech', sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['project.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['app_user.id'], ondelete='CASCADE')
    )

    # Create project_bullet table with vector embedding
    op.create_table(
        'project_bullet',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('project_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('bullet', sa.Text(), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('embedding', Vector(1536), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['project.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['app_user.id'], ondelete='CASCADE')
    )
    op.execute("CREATE INDEX idx_proj_bullet_embedding ON project_bullet USING ivfflat (embedding vector_cosine_ops)")

    # Create skill_category table
    op.create_table(
        'skill_category',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('profile_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['profile_id'], ['profile.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['app_user.id'], ondelete='CASCADE')
    )
    op.create_index('idx_skill_profile', 'skill_category', ['profile_id'])
    op.create_index('idx_skill_user', 'skill_category', ['user_id'])

    # Create skill_item table
    op.create_table(
        'skill_item',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('category_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('item', sa.Text(), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['category_id'], ['skill_category.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['app_user.id'], ondelete='CASCADE')
    )

    # Create job_description table with vector embedding
    op.create_table(
        'job_description',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.Text(), nullable=True),
        sa.Column('raw_text', sa.Text(), nullable=False),
        sa.Column('source_url', sa.Text(), nullable=True),
        sa.Column('company', sa.Text(), nullable=True),
        sa.Column('embedding', Vector(1536), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['app_user.id'], ondelete='CASCADE')
    )
    op.create_index('idx_jd_user', 'job_description', ['user_id'])
    op.execute("CREATE INDEX idx_jd_embedding ON job_description USING ivfflat (embedding vector_cosine_ops)")

    # Create resume_template table
    op.create_table(
        'resume_template',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('version', sa.Text(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('template_kind', sa.Text(), nullable=False),
        sa.Column('files_manifest', postgresql.JSONB(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.UniqueConstraint('name', name='resume_template_name_key')
    )

    # Create generation_status enum
    op.execute("CREATE TYPE generation_status AS ENUM ('QUEUED','RUNNING','DONE','FAILED')")

    # Create generated_resume table
    op.create_table(
        'generated_resume',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('profile_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('job_description_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('template_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('status', postgresql.ENUM('QUEUED', 'RUNNING', 'DONE', 'FAILED', name='generation_status'), nullable=False, server_default='QUEUED'),
        sa.Column('page_count', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('include_projects', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('include_skills', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('profile_snapshot', postgresql.JSONB(), nullable=False),
        sa.Column('jd_snapshot', sa.Text(), nullable=False),
        sa.Column('provider', sa.Text(), nullable=True),
        sa.Column('model_name', sa.Text(), nullable=True),
        sa.Column('prompt_version', sa.Text(), nullable=True),
        sa.Column('ai_output_json', postgresql.JSONB(), nullable=True),
        sa.Column('ai_warnings', postgresql.JSONB(), nullable=True),
        sa.Column('failure_reason', sa.Text(), nullable=True),
        sa.Column('token_usage', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['app_user.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['profile_id'], ['profile.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['job_description_id'], ['job_description.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['template_id'], ['resume_template.id'])
    )
    op.create_index('idx_gen_user', 'generated_resume', ['user_id'])
    op.create_index('idx_gen_profile', 'generated_resume', ['profile_id'])
    op.create_index('idx_gen_status', 'generated_resume', ['status'])

    # Create file_type enum
    op.execute("CREATE TYPE file_type AS ENUM ('LATEX','PDF','DOCX')")

    # Create generated_file table
    op.create_table(
        'generated_file',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('generated_resume_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('type', postgresql.ENUM('LATEX', 'PDF', 'DOCX', name='file_type'), nullable=False),
        sa.Column('storage_key', sa.Text(), nullable=False),
        sa.Column('mime_type', sa.Text(), nullable=False),
        sa.Column('size_bytes', sa.BigInteger(), nullable=False, server_default='0'),
        sa.Column('sha256', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['generated_resume_id'], ['generated_resume.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['app_user.id'], ondelete='CASCADE')
    )
    op.create_index('idx_file_resume', 'generated_file', ['generated_resume_id'])
    op.create_index('idx_file_user', 'generated_file', ['user_id'])

    # Create audit_log table
    op.create_table(
        'audit_log',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('action', sa.Text(), nullable=False),
        sa.Column('entity_type', sa.Text(), nullable=True),
        sa.Column('entity_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('request_id', sa.Text(), nullable=True),
        sa.Column('ip', postgresql.INET(), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['app_user.id'], ondelete='SET NULL')
    )
    op.create_index('idx_audit_user', 'audit_log', ['user_id'])
    op.create_index('idx_audit_action', 'audit_log', ['action'])


def downgrade() -> None:
    op.drop_index('idx_audit_action', table_name='audit_log')
    op.drop_index('idx_audit_user', table_name='audit_log')
    op.drop_table('audit_log')
    op.drop_index('idx_file_user', table_name='generated_file')
    op.drop_index('idx_file_resume', table_name='generated_file')
    op.drop_table('generated_file')
    op.execute('DROP TYPE file_type')
    op.drop_index('idx_gen_status', table_name='generated_resume')
    op.drop_index('idx_gen_profile', table_name='generated_resume')
    op.drop_index('idx_gen_user', table_name='generated_resume')
    op.drop_table('generated_resume')
    op.execute('DROP TYPE generation_status')
    op.drop_table('resume_template')
    op.drop_index('idx_jd_embedding', table_name='job_description')
    op.drop_index('idx_jd_user', table_name='job_description')
    op.drop_table('job_description')
    op.drop_table('skill_item')
    op.drop_index('idx_skill_user', table_name='skill_category')
    op.drop_index('idx_skill_profile', table_name='skill_category')
    op.drop_table('skill_category')
    op.drop_index('idx_proj_bullet_embedding', table_name='project_bullet')
    op.drop_table('project_bullet')
    op.drop_table('project_tech')
    op.drop_table('project_link')
    op.drop_index('idx_proj_user', table_name='project')
    op.drop_index('idx_proj_profile', table_name='project')
    op.drop_table('project')
    op.drop_index('idx_exp_bullet_embedding', table_name='experience_bullet')
    op.drop_table('experience_bullet')
    op.drop_index('idx_exp_user', table_name='experience')
    op.drop_index('idx_exp_profile', table_name='experience')
    op.drop_table('experience')
    op.drop_table('education_highlight')
    op.drop_index('idx_edu_user', table_name='education')
    op.drop_index('idx_edu_profile', table_name='education')
    op.drop_table('education')
    op.drop_index('idx_profile_contact_user', table_name='profile_contact')
    op.drop_index('idx_profile_contact_profile', table_name='profile_contact')
    op.drop_table('profile_contact')
    op.drop_index('idx_profile_user', table_name='profile')
    op.drop_table('profile')
    op.drop_table('app_user')
    op.execute('DROP EXTENSION IF EXISTS vector')

