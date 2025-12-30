-- Authoritative Database Schema for AI Resume Creator
-- Includes pgvector extension for vector similarity search

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- App User table
CREATE TABLE app_user (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cognito_sub       TEXT NOT NULL UNIQUE,
  email             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profile table
CREATE TABLE profile (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  headline          TEXT,
  summary           TEXT,
  location          TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profile_user ON profile(user_id);

-- Profile contact table (encrypted fields)
CREATE TABLE profile_contact (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id        UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  contact_kind      TEXT NOT NULL, -- 'email','phone','address','linkedin','github','website','other'
  label             TEXT,
  ciphertext        BYTEA NOT NULL,
  nonce             BYTEA NOT NULL,
  auth_tag          BYTEA NOT NULL,
  key_version       INT NOT NULL DEFAULT 1,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profile_contact_profile ON profile_contact(profile_id);
CREATE INDEX idx_profile_contact_user ON profile_contact(user_id);

-- Education table
CREATE TABLE education (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id        UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  school            TEXT NOT NULL,
  degree            TEXT,
  major             TEXT,
  gpa               TEXT,
  start_date        DATE,
  end_date          DATE,
  location          TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_edu_profile ON education(profile_id);
CREATE INDEX idx_edu_user ON education(user_id);

-- Education highlights
CREATE TABLE education_highlight (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  education_id      UUID NOT NULL REFERENCES education(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  highlight         TEXT NOT NULL,
  sort_order        INT NOT NULL DEFAULT 0
);

-- Experience table
CREATE TABLE experience (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id        UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  company           TEXT NOT NULL,
  role              TEXT NOT NULL,
  location          TEXT,
  start_date        DATE,
  end_date          DATE,
  is_current        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exp_profile ON experience(profile_id);
CREATE INDEX idx_exp_user ON experience(user_id);

-- Experience bullets (with vector embedding)
CREATE TABLE experience_bullet (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id     UUID NOT NULL REFERENCES experience(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  bullet            TEXT NOT NULL,
  sort_order        INT NOT NULL DEFAULT 0,
  embedding         vector(1536)  -- OpenAI text-embedding-3-small dimension
);

CREATE INDEX idx_exp_bullet_embedding ON experience_bullet USING ivfflat (embedding vector_cosine_ops);

-- Project table
CREATE TABLE project (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id        UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  role              TEXT,
  start_date        DATE,
  end_date          DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_proj_profile ON project(profile_id);
CREATE INDEX idx_proj_user ON project(user_id);

-- Project links
CREATE TABLE project_link (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  label             TEXT,
  url               TEXT NOT NULL
);

-- Project technologies
CREATE TABLE project_tech (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  tech              TEXT NOT NULL
);

-- Project bullets (with vector embedding)
CREATE TABLE project_bullet (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  bullet            TEXT NOT NULL,
  sort_order        INT NOT NULL DEFAULT 0,
  embedding         vector(1536)  -- OpenAI text-embedding-3-small dimension
);

CREATE INDEX idx_proj_bullet_embedding ON project_bullet USING ivfflat (embedding vector_cosine_ops);

-- Skill categories
CREATE TABLE skill_category (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id        UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  name              TEXT NOT NULL, -- e.g. "Languages", "Frameworks", "Tools"
  sort_order        INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_skill_profile ON skill_category(profile_id);
CREATE INDEX idx_skill_user ON skill_category(user_id);

-- Skill items
CREATE TABLE skill_item (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id       UUID NOT NULL REFERENCES skill_category(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  item              TEXT NOT NULL,
  sort_order        INT NOT NULL DEFAULT 0
);

-- Job description table (with vector embedding)
CREATE TABLE job_description (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  title             TEXT,
  raw_text          TEXT NOT NULL,
  source_url        TEXT,
  company           TEXT,
  embedding         vector(1536),  -- OpenAI text-embedding-3-small dimension
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jd_user ON job_description(user_id);
CREATE INDEX idx_jd_embedding ON job_description USING ivfflat (embedding vector_cosine_ops);

-- Resume template table
CREATE TABLE resume_template (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL UNIQUE, -- "JakesResumeATS"
  version           TEXT NOT NULL,        -- "1.0.0"
  description       TEXT,
  template_kind     TEXT NOT NULL,        -- 'jakes-latex'
  files_manifest     JSONB NOT NULL,       -- list of required files and paths
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Generation status enum
CREATE TYPE generation_status AS ENUM ('QUEUED','RUNNING','DONE','FAILED');

-- Generated resume table
CREATE TABLE generated_resume (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  profile_id          UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  job_description_id  UUID REFERENCES job_description(id) ON DELETE SET NULL,
  template_id         UUID NOT NULL REFERENCES resume_template(id),
  status              generation_status NOT NULL DEFAULT 'QUEUED',

  page_count          INT NOT NULL DEFAULT 1,
  include_projects    BOOLEAN NOT NULL DEFAULT TRUE,
  include_skills      BOOLEAN NOT NULL DEFAULT TRUE,

  profile_snapshot    JSONB NOT NULL,
  jd_snapshot         TEXT NOT NULL,

  provider            TEXT,
  model_name          TEXT,
  prompt_version      TEXT,
  ai_output_json      JSONB,
  ai_warnings         JSONB,
  failure_reason      TEXT,
  token_usage         JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gen_user ON generated_resume(user_id);
CREATE INDEX idx_gen_profile ON generated_resume(profile_id);
CREATE INDEX idx_gen_status ON generated_resume(status);

-- File type enum
CREATE TYPE file_type AS ENUM ('LATEX','PDF','DOCX');

-- Generated file table
CREATE TABLE generated_file (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_resume_id UUID NOT NULL REFERENCES generated_resume(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  type                file_type NOT NULL,
  storage_key         TEXT NOT NULL,
  mime_type           TEXT NOT NULL,
  size_bytes          BIGINT NOT NULL DEFAULT 0,
  sha256              TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_file_resume ON generated_file(generated_resume_id);
CREATE INDEX idx_file_user ON generated_file(user_id);

-- Audit log table
CREATE TABLE audit_log (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES app_user(id) ON DELETE SET NULL,
  action              TEXT NOT NULL,
  entity_type         TEXT,
  entity_id           UUID,
  request_id          TEXT,
  ip                  INET,
  user_agent          TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_action ON audit_log(action);

