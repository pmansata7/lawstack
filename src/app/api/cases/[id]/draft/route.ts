import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getProviderFromEnv, createAiProvider, type AiProvider } from "@/lib/ai/provider";
import {
  buildDraftingSystemPrompt,
  buildDraftingUserPrompt,
  buildCaseContext,
} from "@/lib/ai/prompts";
import { CLAIM_TEMPLATES } from "@/lib/legal/claim-templates";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

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

  // Get AI provider
  let provider;
  const aiSetting = await prisma.aiSetting.findUnique({
    where: { organizationId: session.orgId },
  });

  if (aiSetting?.apiKey && aiSetting.provider) {
    provider = createAiProvider(
      aiSetting.provider as AiProvider,
      aiSetting.apiKey,
      aiSetting.draftingModel ?? aiSetting.model,
    );
  } else {
    provider = getProviderFromEnv();
  }

  try {
    const result = await provider.generateCompletion(
      [
        { role: "system", content: buildDraftingSystemPrompt() },
        { role: "user", content: buildDraftingUserPrompt(ctx) },
      ],
      { temperature: 0.4, maxTokens: 8192 },
    );

    // Parse JSON from response
    let jsonStr = result.content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const draft = JSON.parse(jsonStr);

    // Get version number
    const existingDrafts = await prisma.draft.count({
      where: { caseId: id },
    });

    // Build full content from sections
    const fullContent = (draft.sections as Array<{ heading: string; body: string }>)
      ?.map((s) => `${s.heading}\n\n${s.body}`)
      .join("\n\n---\n\n") ?? "";

    const saved = await prisma.draft.create({
      data: {
        caseId: id,
        type: "COMPLAINT",
        title: draft.title ?? `Complaint — ${caseData.title}`,
        content: fullContent,
        sections: draft.sections ?? [],
        citations: draft.citations ?? [],
        version: existingDrafts + 1,
        status: "DRAFT",
      },
    });

    // Update case status
    await prisma.case.update({
      where: { id },
      data: { status: "DRAFTING" },
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
