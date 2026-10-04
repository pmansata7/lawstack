import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session-from-request";
import {
  buildFactsIntakeSystemPrompt,
  buildFactsIntakeUserPrompt,
} from "@/lib/ai/intake-prompts";
import { normalizeFactsIntake } from "@/lib/ai/intake-schemas";
import { parseCompletionJson } from "@/lib/ai/parse-completion-json";
import {
  AiNotConfiguredError,
  getAiProviderForOrganization,
} from "@/lib/ai/org-provider";
import { prisma } from "@/lib/prisma";
import { getCaseForOrganization } from "@/lib/cases/get-case-for-org";
import { buildEvidenceContextForFactsIntake } from "@/lib/evidence/gather-evidence-for-intake";
import { buildTranscriptsContextForIntake } from "@/lib/transcripts/build-transcript-context";
import { applyFactsIntakeSuggestion } from "@/lib/cases/apply-facts-intake";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const caseData = await getCaseForOrganization(id, session.orgId, {
      claims: true,
    });
    if (!caseData) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const narrative =
      typeof body.narrative === "string" ? body.narrative.trim() : "";
    const includeDocuments = body.includeDocuments !== false;
    const apply = Boolean(body.apply);
    const transcriptIds = Array.isArray(body.transcriptIds)
      ? body.transcriptIds.filter(
          (tid: unknown): tid is string => typeof tid === "string",
        )
      : [];
    const hasClientSuggestion = body.suggestion != null;

    if (apply && hasClientSuggestion) {
      const suggestion = normalizeFactsIntake(body.suggestion);
      const created = await applyFactsIntakeSuggestion(id, suggestion);
      const total = await prisma.evidence.count({ where: { caseId: id } });
      return NextResponse.json({
        suggestion,
        applied: created,
        documents: { total, withExtractedText: total },
      });
    }

    const fullEvidenceList = includeDocuments
      ? await prisma.evidence.findMany({
          where: { caseId: id },
          orderBy: { createdAt: "asc" },
        })
      : [];

    const hasDocuments = fullEvidenceList.length > 0;

    const transcripts =
      transcriptIds.length > 0
        ? await prisma.caseTranscript.findMany({
            where: {
              caseId: id,
              id: { in: transcriptIds },
              status: "READY",
            },
          })
        : [];

    const hasTranscripts = transcripts.some(
      (t) => t.content.trim().length >= 20,
    );

    if (narrative.length < 20 && !hasDocuments && !hasTranscripts) {
      return NextResponse.json(
        {
          error:
            "Add a short description (20+ characters), pick a sample prompt, upload a document, or select a transcript for AI to analyze.",
        },
        { status: 400 },
      );
    }

    const provider = await getAiProviderForOrganization(
      session.orgId,
      null,
    );

    const { context: documentContext, documentCount: docsTotal, withTextCount } =
      await buildEvidenceContextForFactsIntake(fullEvidenceList, provider);

    const transcriptContext = buildTranscriptsContextForIntake(transcripts);
    const combinedContext = [transcriptContext, documentContext]
      .filter(Boolean)
      .join("\n\n---\n\n");

    const result = await provider.generateCompletion(
      [
        { role: "system", content: buildFactsIntakeSystemPrompt() },
        {
          role: "user",
          content: buildFactsIntakeUserPrompt(
            narrative,
            {
              title: caseData.title,
              courtType: caseData.courtType,
              jurisdiction: caseData.jurisdiction,
              plaintiff: caseData.plaintiff,
              defendant: caseData.defendant,
              claims: caseData.claims.map((c) => c.claimType),
            },
            combinedContext,
          ),
        },
      ],
      { temperature: 0.25, maxTokens: 8192 },
    );

    const suggestion = normalizeFactsIntake(
      parseCompletionJson<unknown>(result.content),
    );

    if (!apply) {
      return NextResponse.json({
        suggestion,
        documents: { total: docsTotal, withExtractedText: withTextCount },
      });
    }

    const created = await applyFactsIntakeSuggestion(id, suggestion);

    return NextResponse.json({
      suggestion,
      applied: created,
      documents: { total: docsTotal, withExtractedText: withTextCount },
    });
  } catch (error) {
    if (error instanceof AiNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("Facts intake AI error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to generate fact suggestions. Check AI settings and try again.",
      },
      { status: 500 },
    );
  }
}
