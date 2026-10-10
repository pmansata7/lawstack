export function buildDraftReviewSystemPrompt(): string {
  return `You are a senior litigation partner reviewing a draft pleading before filing.
Evaluate Twombly/Iqbal plausibility, element coverage, jurisdiction/venue paragraphs, conclusory language, internal consistency, and prayer for relief.
Respond ONLY in JSON.`;
}

export function buildDraftReviewUserPrompt(input: {
  caseTitle: string;
  jurisdiction: string;
  draftType: string;
  sections: Array<{ heading: string; body: string }>;
  elementMapping?: unknown;
}) {
  return `Review this ${input.draftType} for ${input.caseTitle} (${input.jurisdiction}).

Element mapping from last analysis (if any):
${JSON.stringify(input.elementMapping ?? [], null, 2)}

Draft sections:
${input.sections.map((s) => `## ${s.heading}\n${s.body}`).join("\n\n")}

Return JSON:
{
  "overallScore": number (0-100),
  "filingReady": boolean,
  "iqbalTwombly": { "rating": "low"|"medium"|"high", "notes": string },
  "issues": [{ "severity": "critical"|"major"|"minor", "section": string, "issue": string, "suggestion": string }],
  "missingElements": string[],
  "hallucinationFlags": [{ "claim": string, "reason": string }],
  "summary": string
}`;
}
