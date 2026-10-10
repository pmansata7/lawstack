import type { CaseContext } from "@/lib/ai/prompts";

export type MotionKind =
  | "MTD_RESPONSE"
  | "MOTION_TO_COMPEL"
  | "OPPOSITION"
  | "AMENDED_COMPLAINT";

const MOTION_LABELS: Record<MotionKind, string> = {
  MTD_RESPONSE: "Opposition to Motion to Dismiss",
  MOTION_TO_COMPEL: "Motion to Compel Discovery",
  OPPOSITION: "Opposition Brief",
  AMENDED_COMPLAINT: "Amended Complaint",
};

export function buildMotionSystemPrompt(kind: MotionKind): string {
  return `You are an expert litigator drafting a ${MOTION_LABELS[kind]}.
Produce court-ready sections with numbered paragraphs, proper caption placeholders, and element-aware arguments grounded in the case record.
Respond ONLY in JSON with sections array (heading, body, citations).`;
}

export function buildMotionUserPrompt(ctx: CaseContext, kind: MotionKind): string {
  return `Draft a ${MOTION_LABELS[kind]} for:

CASE: ${ctx.title}
JURISDICTION: ${ctx.jurisdiction}
PARTIES: ${ctx.plaintiff ?? "Plaintiff"} v. ${ctx.defendant ?? "Defendant"}

Use this record:
${JSON.stringify(ctx, null, 2)}

JSON schema:
{
  "title": string,
  "sections": [{ "heading": string, "body": string, "citations": string[] }],
  "citations": [{ "citation": string, "source": string, "factId": null }]
}`;
}

export function buildAnswerSystemPrompt(): string {
  return `You are drafting a defendant's Answer to a civil complaint.
Include caption, general denials/specific responses where appropriate, affirmative defenses, and prayer.
Respond ONLY in JSON with sections array.`;
}

export function buildAnswerUserPrompt(ctx: CaseContext): string {
  return `Draft an Answer for the defendant in:

CASE: ${ctx.title}
JURISDICTION: ${ctx.jurisdiction}
DEFENDANT: ${ctx.defendant ?? "[Defendant]"}

Case record:
${JSON.stringify(ctx, null, 2)}

Return JSON: { "title", "sections", "citations" }`;
}

export function draftTypeFromRequest(
  type: string | undefined,
  motionKind?: string,
): { draftType: "COMPLAINT" | "MOTION" | "ANSWER" | "AMENDMENT"; motionKind?: MotionKind } {
  if (type === "ANSWER") return { draftType: "ANSWER" };
  if (type === "AMENDMENT") return { draftType: "AMENDMENT" };
  if (type === "MOTION") {
    const kind = (motionKind ?? "MTD_RESPONSE") as MotionKind;
    return { draftType: "MOTION", motionKind: kind };
  }
  return { draftType: "COMPLAINT" };
}
