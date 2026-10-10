import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  buildDraftingSystemPrompt,
  buildDraftingUserPrompt,
  buildCaseContext,
} from "@/lib/ai/prompts";
import {
  buildAnswerSystemPrompt,
  buildAnswerUserPrompt,
  buildMotionSystemPrompt,
  buildMotionUserPrompt,
  draftTypeFromRequest,
  type MotionKind,
} from "@/lib/ai/draft-document-prompts";
import { CLAIM_TEMPLATES } from "@/lib/legal/claim-templates";
import { parseAiJson, resolveOrgAiProvider } from "@/lib/drafting/resolve-ai-provider";
import { logAnalyticsEvent } from "@/lib/analytics/log-event";
import type { DraftType } from "@prisma/client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { draftType, motionKind } = draftTypeFromRequest(
    body.type as string | undefined,
    body.motionKind as string | undefined,
  );

  const caseData = await prisma.case.findFirst({
    where: { id, organizationId: session.orgId },
    include: {
      claims: true,
      facts: true,
      evidence: true,
      timeline: { orderBy: { date: "asc" } },
      witnesses: true,
      damages: true,
    },
  });

  if (!caseData) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ctx = buildCaseContext(
    {
      title: caseData.title,
      courtType: caseData.courtType,
      jurisdiction: caseData.jurisdiction,
      plaintiff: caseData.plaintiff,
      defendant: caseData.defendant,
    },
    caseData.claims,
    CLAIM_TEMPLATES,
    caseData.facts,
    caseData.timeline,
    caseData.witnesses,
    caseData.damages,
    caseData.evidence,
  );

  const firmTemplate = await prisma.firmTemplate.findFirst({
    where: {
      organizationId: session.orgId,
      draftType: draftType as DraftType,
      OR: [{ jurisdiction: caseData.jurisdiction }, { jurisdiction: null }],
    },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });

  let systemPrompt = buildDraftingSystemPrompt();
  let userPrompt = buildDraftingUserPrompt(ctx);
  if (draftType === "ANSWER") {
    systemPrompt = buildAnswerSystemPrompt();
    userPrompt = buildAnswerUserPrompt(ctx);
  } else if (draftType === "MOTION") {
    const kind = (motionKind ?? "MTD_RESPONSE") as MotionKind;
    systemPrompt = buildMotionSystemPrompt(kind);
    userPrompt = buildMotionUserPrompt(ctx, kind);
  } else if (draftType === "AMENDMENT") {
    systemPrompt = buildMotionSystemPrompt("AMENDED_COMPLAINT");
    userPrompt = buildMotionUserPrompt(ctx, "AMENDED_COMPLAINT");
  }

  if (firmTemplate?.boilerplate) {
    userPrompt += `\n\nFirm template boilerplate (incorporate where appropriate):\n${firmTemplate.boilerplate}`;
  }
  if (firmTemplate?.sections) {
    userPrompt += `\n\nPreferred section structure:\n${JSON.stringify(firmTemplate.sections)}`;
  }

  try {
    const provider = await resolveOrgAiProvider(
      session.orgId,
      (await prisma.aiSetting.findUnique({ where: { organizationId: session.orgId } }))
        ?.draftingModel,
    );

    const result = await provider.generateCompletion(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.4, maxTokens: 8192 },
    );

    const draft = parseAiJson(result.content) as {
      title?: string;
      sections?: Array<{ heading: string; body: string }>;
      citations?: unknown;
    };

    const existingDrafts = await prisma.draft.count({ where: { caseId: id } });
    const fullContent =
      draft.sections
        ?.map((s) => `${s.heading}\n\n${s.body}`)
        .join("\n\n---\n\n") ?? "";

    const saved = await prisma.draft.create({
      data: {
        caseId: id,
        type: draftType as DraftType,
        motionKind: draftType === "MOTION" ? motionKind ?? "MTD_RESPONSE" : null,
        title:
          draft.title ??
          `${draftType} — ${caseData.title}`,
        content: fullContent,
        sections: draft.sections ?? [],
        citations: draft.citations ?? [],
        version: existingDrafts + 1,
        status: "DRAFT",
      },
    });

    await prisma.case.update({
      where: { id },
      data: { status: "DRAFTING" },
    });

    await logAnalyticsEvent(session.orgId, session.id, "draft.generated", {
      caseId: id,
      draftType,
      motionKind,
    });

    return NextResponse.json({ draft: saved });
  } catch (error) {
    console.error("Draft generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate draft. Check AI provider settings." },
      { status: 500 },
    );
  }
}
