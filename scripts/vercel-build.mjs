import { spawnSync } from "node:child_process";
import { ensurePrismaEnv } from "./ensure-prisma-env.mjs";
import {
  BASELINE_MIGRATION,
  shouldResolveBaselineOnDeployFailure,
} from "./vercel-build-helpers.mjs";

ensurePrismaEnv();

const hasDatabase = Boolean(process.env.DATABASE_URL?.trim());
const hasDirect = Boolean(process.env.DIRECT_URL?.trim());

if (!hasDatabase && !hasDirect) {
  console.error(
    "[vercel-build] Missing DATABASE_URL and DIRECT_URL. Add DATABASE_URL and/or DIRECT_URL to the Vercel Preview environment (Project Settings → Environment Variables).",
  );
  process.exit(1);
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
  if (!inherit) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
  }
  return result;
}

function runMigrateDeploy() {
  const result = run("npx", ["prisma", "migrate", "deploy"], { inherit: false });
  if (result.status === 0) {
    return;
  }

  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  if (shouldResolveBaselineOnDeployFailure(output)) {
    console.warn(
      `[vercel-build] P3005: production DB already has schema but no Prisma migration history. ` +
        `Marking baseline "${BASELINE_MIGRATION}" as applied, then retrying deploy.`,
    );
    run("npx", ["prisma", "migrate", "resolve", "--applied", BASELINE_MIGRATION]);
    const retry = run("npx", ["prisma", "migrate", "deploy"], { inherit: false });
    if (retry.status !== 0) {
      process.exit(retry.status ?? 1);
    }
    return;
  }

  process.exit(result.status ?? 1);
}

if (process.env.VERCEL_ENV === "production") {
  runMigrateDeploy();
}

run("npx", ["next", "build"]);
