/**
 * Production database deploy for GitHub Actions (after supabase db push).
 * Runs prisma migrate deploy (with one-time P3005 baseline resolve) then applies RLS.
 */
import { spawnSync } from "node:child_process";
import { ensurePrismaEnv } from "./ensure-prisma-env.mjs";
import {
  BASELINE_MIGRATION,
  shouldResolveBaselineOnDeployFailure,
} from "./vercel-build-helpers.mjs";

function encodePassword(password) {
  return encodeURIComponent(password);
}

function buildDirectUrlFromSupabaseSecrets() {
  const ref = process.env.SUPABASE_PROJECT_REF?.trim();
  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  if (!ref || !password) return null;
  return `postgresql://postgres:${encodePassword(password)}@db.${ref}.supabase.co:5432/postgres`;
}

function ensureDatabaseUrls() {
  const direct = process.env.DIRECT_URL?.trim();
  const database = process.env.DATABASE_URL?.trim();

  if (!direct && !database) {
    const built = buildDirectUrlFromSupabaseSecrets();
    if (!built) {
      console.error(
        "[ci-database-deploy] Set DIRECT_URL (and optionally DATABASE_URL) in GitHub Actions secrets, " +
          "or ensure SUPABASE_PROJECT_REF + SUPABASE_DB_PASSWORD are set.",
      );
      process.exit(1);
    }
    process.env.DIRECT_URL = built;
    process.env.DATABASE_URL = built;
  }

  ensurePrismaEnv();
}

function run(command, args, { inherit = true } = {}) {
  const result = spawnSync(command, args, {
    stdio: inherit ? "inherit" : "pipe",
    env: process.env,
    encoding: inherit ? undefined : "utf-8",
  });
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  return result;
}

function runMigrateDeploy() {
  console.log("[ci-database-deploy] prisma migrate deploy…");
  let result = run("npx", ["prisma", "migrate", "deploy"], { inherit: false });

  if (result.status === 0) {
    return;
  }

  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  if (shouldResolveBaselineOnDeployFailure(output)) {
    console.warn(
      `[ci-database-deploy] P3005: marking baseline ${BASELINE_MIGRATION} as applied, then retrying.`,
    );
    run("npx", ["prisma", "migrate", "resolve", "--applied", BASELINE_MIGRATION]);
    result = run("npx", ["prisma", "migrate", "deploy"], { inherit: false });
  }

  if (result.status !== 0) {
    if (!result.stdout && !result.stderr) {
      process.exit(result.status ?? 1);
    }
    process.stderr.write(result.stderr ?? "");
    process.stdout.write(result.stdout ?? "");
    process.exit(result.status ?? 1);
  }
}

function runRls() {
  console.log("[ci-database-deploy] applying RLS policies…");
  run("npx", [
    "prisma",
    "db",
    "execute",
    "--schema",
    "prisma/schema.prisma",
    "--file",
    "supabase/rls-policies.sql",
  ]);
}

ensureDatabaseUrls();
runMigrateDeploy();
runRls();
console.log("[ci-database-deploy] done.");
