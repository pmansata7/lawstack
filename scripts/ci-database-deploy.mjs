/**
 * Prisma migrate deploy for GitHub Actions (after supabase db push).
 * Requires DIRECT_URL (session pooler, port 5432) — same value as Vercel.
 * GitHub runners often cannot reach db.<ref>.supabase.co (P1001).
 */
import { spawnSync } from "node:child_process";
import { ensurePrismaEnv } from "./ensure-prisma-env.mjs";
import {
  BASELINE_MIGRATION,
  shouldResolveBaselineOnDeployFailure,
} from "./vercel-build-helpers.mjs";

function ensureDatabaseUrls() {
  const direct = process.env.DIRECT_URL?.trim();
  const database = process.env.DATABASE_URL?.trim();

  if (!direct && !database) {
    console.error(
      "[ci-database-deploy] Missing DIRECT_URL for Prisma.\n" +
        "Add GitHub Actions secret DIRECT_URL = Supabase → Database → Connection string → " +
        "Session pooler (URI, port 5432). Use the same value as Vercel DIRECT_URL.",
    );
    process.exit(1);
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
    process.stderr.write(result.stderr ?? "");
    process.stdout.write(result.stdout ?? "");
    process.exit(result.status ?? 1);
  }
}

ensureDatabaseUrls();
runMigrateDeploy();
console.log("[ci-database-deploy] Prisma migrations applied.");
