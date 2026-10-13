-- Parity with prisma/migrations/20261012183300_add_organization_website
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS website TEXT;
