-- Party role, guided small claims, draft review, platform tables

DO $$ BEGIN
  CREATE TYPE "PartyRole" AS ENUM ('PLAINTIFF', 'DEFENDANT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS party_role "PartyRole" NOT NULL DEFAULT 'PLAINTIFF',
  ADD COLUMN IF NOT EXISTS guided_small_claims BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE drafts
  ADD COLUMN IF NOT EXISTS review_report JSONB,
  ADD COLUMN IF NOT EXISTS motion_kind TEXT;

DO $$ BEGIN
  CREATE TYPE "TaskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'DONE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS intake_sessions (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL UNIQUE REFERENCES cases(id) ON DELETE CASCADE,
  phase TEXT NOT NULL DEFAULT 'active',
  messages JSONB NOT NULL DEFAULT '[]',
  pending_questions JSONB,
  coverage JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS firm_templates (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  draft_type "DraftType" NOT NULL,
  jurisdiction TEXT,
  sections JSONB NOT NULL,
  boilerplate TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS firm_templates_organization_id_idx ON firm_templates(organization_id);

CREATE TABLE IF NOT EXISTS case_tasks (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_email TEXT,
  claim_element TEXT,
  status "TaskStatus" NOT NULL DEFAULT 'OPEN',
  due_date TIMESTAMPTZ,
  created_by_email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS case_tasks_case_id_idx ON case_tasks(case_id);
CREATE INDEX IF NOT EXISTS case_tasks_assignee_email_idx ON case_tasks(assignee_email);

CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  properties JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_events_org_created_idx ON analytics_events(organization_id, created_at);
CREATE INDEX IF NOT EXISTS analytics_events_name_created_idx ON analytics_events(name, created_at);
