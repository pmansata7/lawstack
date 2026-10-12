import { spawnSync } from "node:child_process";
import { ensurePrismaEnv } from "./ensure-prisma-env.mjs";

ensurePrismaEnv();

const hasDatabase = Boolean(process.env.DATABASE_URL?.trim());
const hasDirect = Boolean(process.env.DIRECT_URL?.trim());

if (!hasDatabase && !hasDirect) {
  console.error(
    "[vercel-build] Missing DATABASE_URL and DIRECT_URL. Add DATABASE_URL and/or DIRECT_URL to the Vercel Preview environment (Project Settings → Environment Variables).",
  );
  process.exit(1);
}

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: process.env,
  });
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (process.env.VERCEL_ENV === "production") {
  run("npx", ["prisma", "migrate", "deploy"]);
}

run("npx", ["next", "build"]);
