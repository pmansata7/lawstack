import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getProviderFromEnv, createAiProvider, type AiProvider } from "@/lib/ai/provider";
import {
  buildAnalysisSystemPrompt,
  buildAnalysisUserPrompt,
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

  // Build context for AI
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

  // Get AI provider — from org settings or env
  let provider;
  const aiSetting = await prisma.aiSetting.findUnique({
    where: { organizationId: session.orgId },
  });

  if (aiSetting?.apiKey && aiSetting.provider) {
    provider = createAiProvider(
      aiSetting.provider as AiProvider,
      aiSetting.apiKey,
      aiSetting.analysisModel ?? aiSetting.model,
    );
  } else {
    provider = getProviderFromEnv();
  }

  try {
    const result = await provider.generateCompletion(
      [
        { role: "system", content: buildAnalysisSystemPrompt() },
        { role: "user", content: buildAnalysisUserPrompt(ctx) },
      ],
      { temperature: 0.3, maxTokens: 4096 },
    );

    // Parse JSON from response (handle markdown code fences)
    let jsonStr = result.content.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const analysis = JSON.parse(jsonStr);

    // Save analysis
    const saved = await prisma.legalAnalysis.create({
      data: {
        caseId: id,
        elementMapping: analysis.elementMapping ?? [],
        strengths: analysis.strengths ?? [],
        vulnerabilities: analysis.vulnerabilities ?? [],
        dismissalRisk: analysis.dismissalRisk ?? "medium",
        riskReasoning: analysis.riskReasoning ?? "",
        citedCases: analysis.citedCases ?? [],
        proceduralChecklist: analysis.proceduralChecklist ?? [],
        claimStrength: analysis.claimStrength ?? "moderate",
      },
    });

    // Update case status
    await prisma.case.update({
      where: { id },
      data: { status: "ANALYSIS" },
    });

    return NextResponse.json({ analysis: saved });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to generate analysis. Check AI provider settings." },
      { status: 500 },
    );
  }
}
