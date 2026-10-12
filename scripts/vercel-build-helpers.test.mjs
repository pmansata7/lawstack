import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BASELINE_MIGRATION,
  shouldResolveBaselineOnDeployFailure,
} from "./vercel-build-helpers.mjs";

describe("shouldResolveBaselineOnDeployFailure", () => {
  it("detects Prisma P3005 in CLI output", () => {
    const sample = `Error: P3005
The database schema is not empty.`;
    assert.equal(shouldResolveBaselineOnDeployFailure(sample), true);
  });

  it("ignores unrelated deploy failures", () => {
    assert.equal(shouldResolveBaselineOnDeployFailure("Error: P1001"), false);
  });
});

describe("BASELINE_MIGRATION", () => {
  it("matches the baseline folder under prisma/migrations", () => {
    assert.equal(BASELINE_MIGRATION, "20261012172737_baseline");
  });
});
