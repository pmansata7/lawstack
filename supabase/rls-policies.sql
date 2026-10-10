-- ─── Lawstack Row-Level Security Policies ───────────────────────────
-- Run this after `npx prisma db push` to enable RLS on all tables.
-- Safe to re-run: drops and recreates policies (idempotent).
-- All tables are scoped by organization_id via org_members.
-- Prisma maps user_id to TEXT; Supabase auth.uid() is UUID — compare as text.

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE witnesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE damages ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_transcripts ENABLE ROW LEVEL SECURITY;

-- ─── Organizations ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "org_members_can_read_orgs" ON organizations;
CREATE POLICY "org_members_can_read_orgs" ON organizations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM org_members WHERE org_members.organization_id = organizations.id AND org_members.user_id = auth.uid()::text)
  );

-- ─── Org Members ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "members_can_read_own_membership" ON org_members;
CREATE POLICY "members_can_read_own_membership" ON org_members
  FOR SELECT USING (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "members_can_read_org_members" ON org_members;
CREATE POLICY "members_can_read_org_members" ON org_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM org_members m2 WHERE m2.organization_id = org_members.organization_id AND m2.user_id = auth.uid()::text)
  );

-- ─── Cases ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "members_can_read_cases" ON cases;
CREATE POLICY "members_can_read_cases" ON cases
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM org_members WHERE org_members.organization_id = cases.organization_id AND org_members.user_id = auth.uid()::text)
  );

DROP POLICY IF EXISTS "members_can_insert_cases" ON cases;
CREATE POLICY "members_can_insert_cases" ON cases
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM org_members WHERE org_members.organization_id = cases.organization_id AND org_members.user_id = auth.uid()::text)
  );

DROP POLICY IF EXISTS "members_can_update_cases" ON cases;
CREATE POLICY "members_can_update_cases" ON cases
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM org_members WHERE org_members.organization_id = cases.organization_id AND org_members.user_id = auth.uid()::text)
  );

DROP POLICY IF EXISTS "members_can_delete_cases" ON cases;
CREATE POLICY "members_can_delete_cases" ON cases
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM org_members WHERE org_members.organization_id = cases.organization_id AND org_members.user_id = auth.uid()::text)
  );

-- ─── Claims ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "members_can_read_claims" ON claims;
CREATE POLICY "members_can_read_claims" ON claims
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c
      JOIN org_members m ON m.organization_id = c.organization_id
      WHERE c.id = claims.case_id AND m.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "members_can_modify_claims" ON claims;

DROP POLICY IF EXISTS "members_can_insert_claims" ON claims;
CREATE POLICY "members_can_insert_claims" ON claims
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases c
      JOIN org_members m ON m.organization_id = c.organization_id
      WHERE c.id = claims.case_id AND m.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "members_can_update_claims" ON claims;
CREATE POLICY "members_can_update_claims" ON claims
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM cases c
      JOIN org_members m ON m.organization_id = c.organization_id
      WHERE c.id = claims.case_id AND m.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "members_can_delete_claims" ON claims;
CREATE POLICY "members_can_delete_claims" ON claims
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM cases c
      JOIN org_members m ON m.organization_id = c.organization_id
      WHERE c.id = claims.case_id AND m.user_id = auth.uid()::text
    )
  );

-- ─── Facts ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "members_can_read_facts" ON facts;
CREATE POLICY "members_can_read_facts" ON facts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c
      JOIN org_members m ON m.organization_id = c.organization_id
      WHERE c.id = facts.case_id AND m.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "members_can_modify_facts" ON facts;
CREATE POLICY "members_can_modify_facts" ON facts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cases c
      JOIN org_members m ON m.organization_id = c.organization_id
      WHERE c.id = facts.case_id AND m.user_id = auth.uid()::text
    )
  );

-- ─── Evidence ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "members_can_read_evidence" ON evidence;
CREATE POLICY "members_can_read_evidence" ON evidence
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c
      JOIN org_members m ON m.organization_id = c.organization_id
      WHERE c.id = evidence.case_id AND m.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "members_can_modify_evidence" ON evidence;
CREATE POLICY "members_can_modify_evidence" ON evidence
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cases c
      JOIN org_members m ON m.organization_id = c.organization_id
      WHERE c.id = evidence.case_id AND m.user_id = auth.uid()::text
    )
  );

-- ─── Timeline Entries ──────────────────────────────────────────────
DROP POLICY IF EXISTS "members_can_read_timeline" ON timeline_entries;
CREATE POLICY "members_can_read_timeline" ON timeline_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c
      JOIN org_members m ON m.organization_id = c.organization_id
      WHERE c.id = timeline_entries.case_id AND m.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "members_can_modify_timeline" ON timeline_entries;
CREATE POLICY "members_can_modify_timeline" ON timeline_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cases c
      JOIN org_members m ON m.organization_id = c.organization_id
      WHERE c.id = timeline_entries.case_id AND m.user_id = auth.uid()::text
    )
  );

-- ─── Witnesses ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "members_can_read_witnesses" ON witnesses;
CREATE POLICY "members_can_read_witnesses" ON witnesses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c
      JOIN org_members m ON m.organization_id = c.organization_id
      WHERE c.id = witnesses.case_id AND m.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "members_can_modify_witnesses" ON witnesses;
CREATE POLICY "members_can_modify_witnesses" ON witnesses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cases c
      JOIN org_members m ON m.organization_id = c.organization_id
      WHERE c.id = witnesses.case_id AND m.user_id = auth.uid()::text
    )
  );

-- ─── Damages ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "members_can_read_damages" ON damages;
CREATE POLICY "members_can_read_damages" ON damages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c
      JOIN org_members m ON m.organization_id = c.organization_id
      WHERE c.id = damages.case_id AND m.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "members_can_modify_damages" ON damages;
CREATE POLICY "members_can_modify_damages" ON damages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cases c
      JOIN org_members m ON m.organization_id = c.organization_id
      WHERE c.id = damages.case_id AND m.user_id = auth.uid()::text
    )
  );

-- ─── Legal Analyses ────────────────────────────────────────────────
DROP POLICY IF EXISTS "members_can_read_analyses" ON legal_analyses;
CREATE POLICY "members_can_read_analyses" ON legal_analyses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c
      JOIN org_members m ON m.organization_id = c.organization_id
      WHERE c.id = legal_analyses.case_id AND m.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "members_can_modify_analyses" ON legal_analyses;
CREATE POLICY "members_can_modify_analyses" ON legal_analyses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cases c
      JOIN org_members m ON m.organization_id = c.organization_id
      WHERE c.id = legal_analyses.case_id AND m.user_id = auth.uid()::text
    )
  );

-- ─── Drafts ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "members_can_read_drafts" ON drafts;
CREATE POLICY "members_can_read_drafts" ON drafts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c
      JOIN org_members m ON m.organization_id = c.organization_id
      WHERE c.id = drafts.case_id AND m.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "members_can_modify_drafts" ON drafts;
CREATE POLICY "members_can_modify_drafts" ON drafts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cases c
      JOIN org_members m ON m.organization_id = c.organization_id
      WHERE c.id = drafts.case_id AND m.user_id = auth.uid()::text
    )
  );

-- ─── Comments ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "members_can_read_comments" ON comments;
CREATE POLICY "members_can_read_comments" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM drafts d
      JOIN cases c ON c.id = d.case_id
      JOIN org_members m ON m.organization_id = c.organization_id
      WHERE d.id = comments.draft_id AND m.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "members_can_modify_comments" ON comments;
CREATE POLICY "members_can_modify_comments" ON comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM drafts d
      JOIN cases c ON c.id = d.case_id
      JOIN org_members m ON m.organization_id = c.organization_id
      WHERE d.id = comments.draft_id AND m.user_id = auth.uid()::text
    )
  );

-- ─── Collaborations ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "members_can_read_collaborations" ON collaborations;
CREATE POLICY "members_can_read_collaborations" ON collaborations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c
      JOIN org_members m ON m.organization_id = c.organization_id
      WHERE c.id = collaborations.case_id AND m.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "members_can_modify_collaborations" ON collaborations;
CREATE POLICY "members_can_modify_collaborations" ON collaborations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cases c
      JOIN org_members m ON m.organization_id = c.organization_id
      WHERE c.id = collaborations.case_id AND m.user_id = auth.uid()::text
    )
  );

-- ─── AI Settings ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "members_can_read_ai_settings" ON ai_settings;
CREATE POLICY "members_can_read_ai_settings" ON ai_settings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM org_members WHERE org_members.organization_id = ai_settings.organization_id AND org_members.user_id = auth.uid()::text)
  );

DROP POLICY IF EXISTS "members_can_modify_ai_settings" ON ai_settings;
CREATE POLICY "members_can_modify_ai_settings" ON ai_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM org_members WHERE org_members.organization_id = ai_settings.organization_id AND org_members.user_id = auth.uid()::text)
  );

-- ─── Case Transcripts ───────────────────────────────────────────────
DROP POLICY IF EXISTS "members_can_read_case_transcripts" ON case_transcripts;
CREATE POLICY "members_can_read_case_transcripts" ON case_transcripts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases c
      JOIN org_members m ON m.organization_id = c.organization_id
      WHERE c.id = case_transcripts.case_id AND m.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "members_can_insert_case_transcripts" ON case_transcripts;
CREATE POLICY "members_can_insert_case_transcripts" ON case_transcripts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases c
      JOIN org_members m ON m.organization_id = c.organization_id
      WHERE c.id = case_transcripts.case_id AND m.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "members_can_update_case_transcripts" ON case_transcripts;
CREATE POLICY "members_can_update_case_transcripts" ON case_transcripts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM cases c
      JOIN org_members m ON m.organization_id = c.organization_id
      WHERE c.id = case_transcripts.case_id AND m.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "members_can_delete_case_transcripts" ON case_transcripts;
CREATE POLICY "members_can_delete_case_transcripts" ON case_transcripts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM cases c
      JOIN org_members m ON m.organization_id = c.organization_id
      WHERE c.id = case_transcripts.case_id AND m.user_id = auth.uid()::text
    )
  );

-- ─── Storage: evidence bucket ───────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence', 'evidence', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "members_can_upload_evidence" ON storage.objects;
CREATE POLICY "members_can_upload_evidence" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'evidence' AND
    EXISTS (SELECT 1 FROM org_members WHERE org_members.user_id = auth.uid()::text)
  );

DROP POLICY IF EXISTS "members_can_read_evidence_files" ON storage.objects;
CREATE POLICY "members_can_read_evidence_files" ON storage.objects
  FOR SELECT USING (bucket_id = 'evidence');

DROP POLICY IF EXISTS "members_can_delete_evidence_files" ON storage.objects;
CREATE POLICY "members_can_delete_evidence_files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'evidence' AND
    EXISTS (SELECT 1 FROM org_members WHERE org_members.user_id = auth.uid()::text)
  );
