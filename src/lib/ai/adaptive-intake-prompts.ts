import type { IntakeQuestion } from "@/lib/legal/intake-requirements";

export function buildAdaptiveIntakeSystemPrompt(partyRole: "PLAINTIFF" | "DEFENDANT") {
  return `You are a litigation intake specialist for ${partyRole === "DEFENDANT" ? "defense" : "plaintiff"} matters.
Your job is to identify legally material gaps in the user's narrative and ask focused follow-up questions.
Return strict JSON only.`;
}

export function buildAdaptiveIntakeUserPrompt(input: {
  caseTitle: string;
  jurisdiction: string;
  claimTypes: string[];
  narrative: string;
  priorMessages: Array<{ role: string; content: string }>;
  questionCatalog: IntakeQuestion[];
  answeredIds: string[];
}) {
  return `Case: ${input.caseTitle}
Jurisdiction: ${input.jurisdiction}
Claims: ${input.claimTypes.join(", ") || "unknown"}

Narrative:
${input.narrative}

Prior Q&A:
${input.priorMessages.map((m) => `${m.role}: ${m.content}`).join("\n") || "(none)"}

Question catalog (only ask from this list, max 3 at a time):
${JSON.stringify(input.questionCatalog, null, 2)}

Already answered question ids: ${input.answeredIds.join(", ") || "none"}

Respond with JSON:
{
  "complete": boolean,
  "coverage": { "answeredQuestionIds": string[], "missingCategories": string[] },
  "nextQuestions": [{ "id": string, "prompt": string, "whyItMatters": string }],
  "suggestedFacts": [{ "statement": string, "category": "INCIDENT"|"BACKGROUND"|"DAMAGES"|"PROCEDURAL"|"OTHER" }],
  "evidenceRequests": [{ "title": string, "reason": string }]
}`;
}

export function buildAdaptiveAnswerMergePrompt(input: {
  questionId: string;
  question: string;
  answer: string;
  existingFacts: string[];
}) {
  return `The user answered an intake follow-up.

Question (${input.questionId}): ${input.question}
Answer: ${input.answer}

Existing facts:
${input.existingFacts.map((f) => `- ${f}`).join("\n") || "(none)"}

Return JSON:
{
  "factsToAdd": [{ "statement": string, "category": "INCIDENT"|"BACKGROUND"|"DAMAGES"|"PROCEDURAL"|"OTHER" }],
  "timelineToAdd": [{ "date": "YYYY-MM-DD"|null, "title": string, "description": string }],
  "notes": string
}`;
}
