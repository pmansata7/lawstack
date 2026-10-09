// ─── AI Prompt Builders for Legal Analysis & Drafting ────────────────

import type { ClaimTemplate } from "@/lib/legal/claim-templates";

export interface CaseContext {
  title: string;
  courtType: string;
  jurisdiction: string;
  plaintiff?: string;
  defendant?: string;
  claims: Array<{
    type: string;
    label: string;
    elements: Array<{ element: string; description: string }>;
  }>;
  facts: Array<{
    statement: string;
    date?: string;
    category: string;
  }>;
  timeline: Array<{
    date: string;
    title: string;
    description?: string;
  }>;
  witnesses: Array<{
    name: string;
    statement?: string;
  }>;
  damages: Array<{
    category: string;
    amount: number;
    description?: string;
  }>;
  evidence: Array<{
    title: string;
    type: string;
  }>;
}

// ─── Legal Analysis Prompt ───────────────────────────────────────────

export function buildAnalysisSystemPrompt(): string {
  return `You are an expert litigation attorney and legal analyst with deep expertise in civil procedure, tort law, and contract law.

Your task is to analyze a case's facts against the legal elements of each claim, assess the strength of the case, identify vulnerabilities, and evaluate the risk of dismissal under Iqbal/Twombly plausibility standards.

You must:
1. Map each fact to the specific legal element it supports (or fails to support)
2. Identify gaps where elements lack supporting facts
3. Assess overall claim strength (strong / moderate / weak)
4. Flag vulnerabilities a defendant would exploit in a motion to dismiss
5. Rate dismissal risk (low / medium / high) with reasoning
6. Suggest supporting precedent (real, well-known cases only)
7. List procedural requirements for the chosen jurisdiction

Respond ONLY in valid JSON format matching the provided schema. Do not include any text outside the JSON.`;
}

export function buildAnalysisUserPrompt(ctx: CaseContext): string {
  const claimsText = ctx.claims
    .map(
      (c) =>
        `Claim: ${c.label} (${c.type})\nElements:\n${c.elements.map((e) => `  - ${e.element}: ${e.description}`).join("\n")}`,
    )
    .join("\n\n");

  const factsText = ctx.facts
    .map((f) => `- [${f.category}]${f.date ? ` (${f.date})` : ""} ${f.statement}`)
    .join("\n");

  const timelineText = ctx.timeline
    .map((t) => `- ${t.date}: ${t.title}${t.description ? ` — ${t.description}` : ""}`)
    .join("\n");

  const witnessesText = ctx.witnesses
    .map((w) => `- ${w.name}${w.statement ? `: ${w.statement}` : ""}`)
    .join("\n");

  const damagesText = ctx.damages
    .map((d) => `- ${d.category}: $${d.amount.toLocaleString()}${d.description ? ` (${d.description})` : ""}`)
    .join("\n");

  const evidenceText = ctx.evidence
    .map((e) => `- [${e.type}] ${e.title}`)
    .join("\n");

  return `Analyze the following case and provide a comprehensive legal analysis.

CASE: ${ctx.title}
COURT TYPE: ${ctx.courtType}
JURISDICTION: ${ctx.jurisdiction}
PLAINTIFF: ${ctx.plaintiff ?? "TBD"}
DEFENDANT: ${ctx.defendant ?? "TBD"}

CLAIMS:
${claimsText}

FACTS:
${factsText || "No facts entered yet."}

TIMELINE:
${timelineText || "No timeline entries yet."}

WITNESSES:
${witnessesText || "No witnesses entered yet."}

DAMAGES:
${damagesText || "No damages entered yet."}

EVIDENCE:
${evidenceText || "No evidence uploaded yet."}

Respond in this exact JSON structure:
{
  "elementMapping": [
    {
      "claim": "Claim label",
      "elements": [
        {
          "element": "Element name",
          "status": "satisfied" | "partially_supported" | "gap",
          "supportingFacts": ["fact statements that support this element"],
          "gaps": ["description of what's missing"]
        }
      ]
    }
  ],
  "strengths": ["strength 1", "strength 2"],
  "vulnerabilities": ["vulnerability 1", "vulnerability 2"],
  "dismissalRisk": "low" | "medium" | "high",
  "riskReasoning": "detailed explanation of the dismissal risk",
  "claimStrength": "strong" | "moderate" | "weak",
  "citedCases": [
    {
      "citation": "Case Name, Volume Reporter Page (Year)",
      "summary": "Brief summary of the case and its relevance",
      "relevance": "How this case supports the claim"
    }
  ],
  "proceduralChecklist": [
    {
      "requirement": "Name of the procedural requirement",
      "met": true | false,
      "notes": "Any notes about this requirement"
    }
  ]
}`;
}

// ─── Complaint Drafting Prompt ──────────────────────────────────────

export function buildDraftingSystemPrompt(): string {
  return `You are an expert litigation attorney drafting a formal legal complaint.

Your task is to generate a complete, court-ready complaint that:
1. Survives a motion to dismiss under Iqbal/Twombly plausibility standards
2. Pleads each cause of action with specific factual allegations mapped to legal elements
3. Includes proper caption, jurisdiction, venue, parties, factual allegations, causes of action, prayer for relief, and signature block
4. Uses formal legal language and proper formatting
5. Includes citations to supporting case law where appropriate
6. Is structured in numbered paragraphs

Format the complaint in these sections:
- CAPTION (court name, parties, case title, case number placeholder)
- INTRODUCTION
- JURISDICTION AND VENUE
- PARTIES
- FACTUAL ALLEGATIONS (numbered paragraphs)
- CAUSES OF ACTION (each claim with element-by-element pleading)
- PRAYER FOR RELIEF
- JURY DEMAND (if applicable)
- SIGNATURE BLOCK

Respond ONLY in valid JSON format matching the provided schema. Do not include any text outside the JSON.`;
}

export function buildDraftingUserPrompt(ctx: CaseContext): string {
  const claimsText = ctx.claims
    .map(
      (c) =>
        `${c.label}:\n${c.elements.map((e) => `  ${e.element}: ${e.description}`).join("\n")}`,
    )
    .join("\n\n");

  const factsText = ctx.facts
    .map((f, i) => `${i + 1}. [${f.category}]${f.date ? ` (${f.date})` : ""} ${f.statement}`)
    .join("\n");

  const timelineText = ctx.timeline
    .map((t) => `${t.date}: ${t.title}${t.description ? ` — ${t.description}` : ""}`)
    .join("\n");

  const damagesText = ctx.damages
    .map((d) => `${d.category}: $${d.amount.toLocaleString()}${d.description ? ` — ${d.description}` : ""}`)
    .join("\n");

  const witnessesText = ctx.witnesses
    .map((w) => `${w.name}${w.statement ? ` — ${w.statement}` : ""}`)
    .join("\n");

  return `Draft a complete complaint for the following case.

CASE: ${ctx.title}
COURT TYPE: ${ctx.courtType}
JURISDICTION: ${ctx.jurisdiction}
PLAINTIFF: ${ctx.plaintiff ?? "[Plaintiff Name]"}
DEFENDANT: ${ctx.defendant ?? "[Defendant Name]"}

CLAIMS TO PLEAD:
${claimsText}

KEY FACTS:
${factsText || "No specific facts provided — use plausible placeholders."}

TIMELINE:
${timelineText || "No timeline provided."}

WITNESSES:
${witnessesText || "No witnesses provided."}

DAMAGES:
${damagesText || "No damages specified."}

Respond in this exact JSON structure:
{
  "title": "Complaint title",
  "sections": [
    {
      "heading": "Section heading (e.g., CAPTION, JURISDICTION AND VENUE)",
      "body": "Full text of this section with numbered paragraphs where appropriate",
      "citations": ["any case citations referenced in this section"]
    }
  ],
  "citations": [
    {
      "citation": "Full citation",
      "source": "Section this citation appears in",
      "factId": null
    }
  ]
}`;
}

// ─── Helper: Build CaseContext from DB records ──────────────────────

export function buildCaseContext(
  caseData: {
    title: string;
    courtType: string;
    jurisdiction: string;
    plaintiff: string | null;
    defendant: string | null;
  },
  claims: Array<{
    claimType: string;
    elements: unknown;
  }>,
  claimTemplates: ClaimTemplate[],
  facts: Array<{ statement: string; date: Date | null; category: string }>,
  timeline: Array<{ date: Date; title: string; description: string | null }>,
  witnesses: Array<{ name: string; statement: string | null }>,
  damages: Array<{ category: string; amount: number; description: string | null }>,
  evidence: Array<{ title: string; type: string }>,
): CaseContext {
  return {
    title: caseData.title,
    courtType: caseData.courtType,
    jurisdiction: caseData.jurisdiction,
    plaintiff: caseData.plaintiff ?? undefined,
    defendant: caseData.defendant ?? undefined,
    claims: claims.map((c) => {
      const template = claimTemplates.find(
        (t) => t.type === c.claimType,
      );
      return {
        type: c.claimType,
        label: template?.label ?? c.claimType,
        elements:
          (c.elements as Array<{ element: string; description: string }>) ??
          template?.elements ??
          [],
      };
    }),
    facts: facts.map((f) => ({
      statement: f.statement,
      date: f.date ? f.date.toISOString().split("T")[0] : undefined,
      category: f.category,
    })),
    timeline: timeline.map((t) => ({
      date: t.date.toISOString().split("T")[0],
      title: t.title,
      description: t.description ?? undefined,
    })),
    witnesses: witnesses.map((w) => ({
      name: w.name,
      statement: w.statement ?? undefined,
    })),
    damages: damages.map((d) => ({
      category: d.category,
      amount: d.amount,
      description: d.description ?? undefined,
    })),
    evidence: evidence.map((e) => ({
      title: e.title,
      type: e.type,
    })),
  };
}

// ─── Case assistant chat ─────────────────────────────────────────────

export function buildCaseChatSystemPrompt(ctx: CaseContext): string {
  const summary = JSON.stringify(ctx, null, 2);
  return `You are a litigation assistant embedded in Lawstack. You help attorneys and paralegals understand their matter, plan next steps, and ask clarifying questions about facts, claims, procedure, and drafting.

Rules:
- Ground answers in the case record below when relevant; say when information is missing from the file.
- Be concise and practical. Use short paragraphs or bullets.
- You are not the client's lawyer; do not give definitive legal advice—frame guidance as litigation strategy and checklist items.
- If the user is at an early stage with sparse facts, suggest what to collect next.

Current case record (JSON):
${summary}`;
}
