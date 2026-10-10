/**
 * Lightweight eval harness — run with: npx tsx evals/run-eval.ts
 * Does not call live AI unless EVAL_LIVE=1 and API keys are set.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { normalizeCaseIntake } from "../src/lib/ai/intake-schemas";
import { getIntakeQuestionsForClaims } from "../src/lib/legal/intake-requirements";
import { getProceduralRulePack, mergeProceduralChecklist } from "../src/lib/legal/procedural-rule-packs";

type Fixture = {
  title: string;
  jurisdiction: string;
  claimTypes: string[];
  narrative: string;
  minFactsAfterIntake: number;
};

function loadFixture(name: string): Fixture {
  const path = join(process.cwd(), "evals/fixtures", name);
  return JSON.parse(readFileSync(path, "utf8")) as Fixture;
}

async function main() {
  const fixture = loadFixture("smoke-case.json");
  const questions = getIntakeQuestionsForClaims(fixture.claimTypes);
  const pack = getProceduralRulePack(fixture.jurisdiction);
  const merged = mergeProceduralChecklist([], pack);

  const intake = normalizeCaseIntake({
    title: fixture.title,
    courtType: "SMALL_CLAIMS",
    jurisdiction: fixture.jurisdiction,
    courtName: "",
    caseNumber: "",
    plaintiff: "Tenant",
    defendant: "Landlord",
    opposingParty: "Landlord",
    claimTypes: fixture.claimTypes,
    notes: "eval",
  });

  const checks: Array<{ name: string; pass: boolean }> = [
    { name: "intake title preserved", pass: intake.title === fixture.title },
    {
      name: "claim-specific questions exist",
      pass: questions.length >= fixture.minFactsAfterIntake,
    },
    {
      name: "procedural pack merged",
      pass: merged.length >= (pack?.items.length ?? 0),
    },
  ];

  if (process.env.EVAL_LIVE === "1") {
    const { getProviderFromEnv } = await import("../src/lib/ai/provider");
    const provider = getProviderFromEnv();
    const res = await provider.generateCompletion(
      [
        { role: "system", content: "Return JSON { ok: true }" },
        { role: "user", content: "ping" },
      ],
      { maxTokens: 32 },
    );
    checks.push({
      name: "live provider responds",
      pass: res.content.length > 0,
    });
  }

  const failed = checks.filter((c) => !c.pass);
  for (const c of checks) {
    console.log(c.pass ? "✓" : "✗", c.name);
  }
  if (failed.length) {
    process.exit(1);
  }
  console.log("Eval harness passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
