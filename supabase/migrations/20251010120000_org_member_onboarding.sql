-- Persist per-user workspace onboarding (dismiss + manual step flags)
ALTER TABLE org_members
ADD COLUMN IF NOT EXISTS onboarding JSONB;
