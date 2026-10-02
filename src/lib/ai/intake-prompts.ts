import {
  CLAIM_TEMPLATES,
  DAMAGE_CATEGORIES,
  getAllJurisdictionOptions,
} from "@/lib/legal/claim-templates";

const JURISDICTION_LIST = getAllJurisdictionOptions()
  .map((j) => `${j.value} (${j.label})`)
  .join("\n");

const CLAIM_TYPE_LIST = CLAIM_TEMPLATES.map(
  (c) => `${c.type} — ${c.label} [${c.category}]`,
).join("\n");

const DAMAGE_CATEGORY_LIST = DAMAGE_CATEGORIES.map(
  (d) => `${d.value} — ${d.label}`,
).join("\n");

const FACT_CATEGORIES = [
  "INCIDENT",
  "BACKGROUND",
  "DAMAGES",
  "PROCEDURAL",
  "WITNESS",
  "DOCUMENT",
  "OTHER",
].join(", ");

export function buildCaseIntakeSystemPrompt(): string {
  return `You are a litigation intake assistant. From a plain-language description, extract structured case setup fields for a U.S. civil case.

Rules:
- Prefer SMALL_CLAIMS court type when the dispute is clearly within small claims limits (money owed, security deposit, minor property damage, etc.).
- jurisdiction MUST be exactly one of the provided jurisdiction value codes (e.g. ca-small-claims), or empty string if unknown.
- claimTypes MUST use only claim type codes from the provided list. Pick all that reasonably apply (1–4 typical).
- Do not invent parties or amounts not implied by the narrative; use empty strings when unknown.
- Respond ONLY with valid JSON matching the schema. No markdown.`;
}

export function buildCaseIntakeUserPrompt(narrative: string): string {
  return `User narrative:
"""
${narrative}
"""

Valid jurisdiction values (use the code before the parenthesis):
${JURISDICTION_LIST}

Valid claim type codes:
${CLAIM_TYPE_LIST}

Respond with this JSON:
{
  "title": "Case caption style title e.g. Smith v. Acme Corp.",
  "courtType": "FEDERAL" | "STATE" | "SMALL_CLAIMS",
  "jurisdiction": "jurisdiction code or empty string",
  "courtName": "optional full court name",
  "caseNumber": "optional",
  "plaintiff": "",
  "defendant": "",
  "opposingParty": "often same as defendant",
  "claimTypes": ["claim_type_code"],
  "notes": "one sentence on assumptions or gaps"
}`;
}

export function buildFactsIntakeSystemPrompt(): string {
  return `You are a litigation paralegal organizing case facts. From uploaded case documents, an optional user narrative, and existing case metadata, produce structured facts, timeline, witnesses, and damages for U.S. civil litigation.

Rules:
- When uploaded documents are provided, treat them as the primary source of truth; extract facts, dates, parties, amounts, and events from document text and filenames/paths.
- Cite document titles or file paths in fact "source" fields when a fact comes from a specific upload.
- fact category must be one of: ${FACT_CATEGORIES}
- damage category must use value codes from the provided list
- dates as YYYY-MM-DD when possible; omit date field when unknown
- Be specific and pleading-ready; split distinct facts into separate items
- Respond ONLY with valid JSON. No markdown.`;
}

export function buildFactsIntakeUserPrompt(
  narrative: string,
  caseSummary: {
    title: string;
    courtType: string;
    jurisdiction: string;
    plaintiff?: string | null;
    defendant?: string | null;
    claims: string[];
  },
  documentContext?: string,
): string {
  const narrativeSection =
    narrative.trim().length > 0
      ? `User narrative:\n"""\n${narrative}\n"""`
      : "User narrative: (none — rely on uploaded documents.)";

  const documentsSection =
    documentContext && documentContext.trim().length > 0
      ? `Uploaded documents:\n"""\n${documentContext}\n"""`
      : "Uploaded documents: (none)";

  return `Case: ${caseSummary.title}
Court: ${caseSummary.courtType}
Jurisdiction: ${caseSummary.jurisdiction}
Plaintiff: ${caseSummary.plaintiff ?? "TBD"}
Defendant: ${caseSummary.defendant ?? "TBD"}
Claims: ${caseSummary.claims.join(", ") || "none yet"}

${documentsSection}

${narrativeSection}

Damage category codes:
${DAMAGE_CATEGORY_LIST}

Respond with:
{
  "facts": [
    { "statement": "", "date": "YYYY-MM-DD or omit", "category": "INCIDENT", "source": "optional" }
  ],
  "timeline": [
    { "date": "YYYY-MM-DD", "title": "", "description": "optional" }
  ],
  "witnesses": [
    { "name": "", "contact": "optional", "statement": "optional" }
  ],
  "damages": [
    { "category": "medical", "amount": 0, "description": "optional" }
  ],
  "notes": "brief note on gaps or assumptions"
}`;
}
