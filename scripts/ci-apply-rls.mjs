/**
 * Apply supabase/rls-policies.sql in CI (same process as ensurePrismaEnv).
 */
import { spawnSync } from "node:child_process";
import { ensurePrismaEnv } from "./ensure-prisma-env.mjs";

function requireDatabaseUrl() {
  ensurePrismaEnv();
  const database = process.env.DATABASE_URL?.trim();
  if (!database) {
    console.error(
      "[ci-apply-rls] Missing DIRECT_URL for Prisma.\n" +
        "Add GitHub Actions secret DIRECT_URL (session pooler, port 5432).",
    );
    process.exit(1);
  }
}

requireDatabaseUrl();

console.log("[ci-apply-rls] applying supabase/rls-policies.sql…");
const result = spawnSync(
  "npx",
  [
    "prisma",
    "db",
    "execute",
    "--schema",
    "prisma/schema.prisma",
    "--file",
    "supabase/rls-policies.sql",
  ],
  { stdio: "inherit", env: process.env },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log("[ci-apply-rls] RLS policies applied.");
