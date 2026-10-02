-- Adds SMALL_CLAIMS to the Prisma CourtType enum (required for small claims cases).
-- Run in Supabase SQL Editor, or: psql "$DATABASE_URL" -f supabase/migrations/20251002000000_add_small_claims_court_type.sql
-- Safe to run more than once on PostgreSQL 12+.

ALTER TYPE "CourtType" ADD VALUE IF NOT EXISTS 'SMALL_CLAIMS';
