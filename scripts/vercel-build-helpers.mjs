/** Matches `prisma/migrations/*_baseline` — existing prod DBs need this marked applied once. */
export const BASELINE_MIGRATION = "20261012172737_baseline";

/** True when `prisma migrate deploy` failed because the DB has schema but no migration history. */
export function shouldResolveBaselineOnDeployFailure(output) {
  return String(output).includes("P3005");
}
