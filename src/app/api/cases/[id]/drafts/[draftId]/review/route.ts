import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  buildDraftReviewSystemPrompt,
  buildDraftReviewUserPrompt,
} from "@/lib/ai/draft-review-prompts";
import { parseAiJson, resolveOrgAiProvider } from "@/lib/drafting/resolve-ai-provider";
import { logAnalyticsEvent } from "@/lib/analytics/log-event";
import type { Prisma } from "@prisma/client";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; draftId: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, draftId } = await params;

  const draft = await prisma.draft.findFirst({
    where: { id: draftId, caseId: id, case: { organizationId: session.orgId } },
  });
  if (!draft) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const caseData = await prisma.case.findFirst({
    where: { id, organizationId: session.orgId },
  });
  const latestAnalysis = await prisma.legalAnalysis.findFirst({
    where: { caseId: id },
    orderBy: { createdAt: "desc" },
  });

  const sections = (draft.sections as Array<{ heading: string; body: string }>) ?? [];

  try {
    const provider = await resolveOrgAiProvider(session.orgId);
    const result = await provider.generateCompletion(
      [
        { role: "system", content: buildDraftReviewSystemPrompt() },
        {
          role: "user",
          content: buildDraftReviewUserPrompt({
            caseTitle: caseData?.title ?? "Matter",
            jurisdiction: caseData?.jurisdiction ?? "",
            draftType: draft.type,
            sections,
            elementMapping: latestAnalysis?.elementMapping,
          }),
        },
      ],
      { temperature: 0.2, maxTokens: 4096 },
    );

    const report = parseAiJson(result.content);

    const updated = await prisma.draft.update({
      where: { id: draftId },
      data: {
        reviewReport: report as Prisma.InputJsonValue,
        status: "IN_REVIEW",
      },
    });

    await logAnalyticsEvent(session.orgId, session.id, "draft.review_run", {
      caseId: id,
      draftId,
      score: (report as { overallScore?: number }).overallScore,
    });

    return NextResponse.json({ draft: updated, report });
  } catch (error) {
    console.error("Draft review error:", error);
    return NextResponse.json({ error: "Review agent failed" }, { status: 500 });
  }
}
