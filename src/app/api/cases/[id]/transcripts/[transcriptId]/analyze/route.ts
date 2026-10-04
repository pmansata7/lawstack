import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session-from-request";
import { getCaseForOrganization } from "@/lib/cases/get-case-for-org";
import { prisma } from "@/lib/prisma";
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
import { buildEvidenceContextForFactsIntake } from "@/lib/evidence/gather-evidence-for-intake";
import { buildTranscriptsContextForIntake } from "@/lib/transcripts/build-transcript-context";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; transcriptId: string }> },
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: caseId, transcriptId } = await params;
    const caseData = await getCaseForOrganization(caseId, session.orgId, {
      claims: true,
    });
    if (!caseData) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const narrative =
      typeof body.narrative === "string" ? body.narrative.trim() : "";
    const includeDocuments = body.includeDocuments !== false;
    const apply = body.apply !== false;

    const transcript = await prisma.caseTranscript.findFirst({
      where: { id: transcriptId, caseId },
    });
    if (!transcript) {
      return NextResponse.json({ error: "Transcript not found" }, { status: 404 });
    }

    if (transcript.status !== "READY" || transcript.content.trim().length < 20) {
      return NextResponse.json(
        {
          error:
            "Transcript needs transcribed text (20+ characters). Run Transcribe first for recordings.",
        },
        { status: 400 },
      );
    }

    const evidenceList = includeDocuments
      ? await prisma.evidence.findMany({
          where: { caseId },
          orderBy: { createdAt: "asc" },
        })
      : [];

    const provider = await getAiProviderForOrganization(session.orgId, null);

    const { context: documentContext, documentCount, withTextCount } =
      await buildEvidenceContextForFactsIntake(evidenceList, provider);

    const transcriptContext = buildTranscriptsContextForIntake([transcript]);
    const combinedContext = [transcriptContext, documentContext]
      .filter(Boolean)
      .join("\n\n---\n\n");

    const result = await provider.generateCompletion(
      [
        { role: "system", content: buildFactsIntakeSystemPrompt() },
        {
          role: "user",
          content: buildFactsIntakeUserPrompt(
            narrative ||
              "Extract litigation facts from the selected meeting/call transcript.",
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
        transcriptId,
        documents: { total: documentCount, withExtractedText: withTextCount },
      });
    }

    const created = await prisma.$transaction(async (tx) => {
      const facts = await Promise.all(
        suggestion.facts.map((f) =>
          tx.fact.create({
            data: {
              caseId,
              statement: f.statement,
              date: f.date ? new Date(f.date) : null,
              category: f.category as
                | "INCIDENT"
                | "BACKGROUND"
                | "DAMAGES"
                | "PROCEDURAL"
                | "WITNESS"
                | "DOCUMENT"
                | "OTHER",
              source: f.source ?? transcript.title,
            },
          }),
        ),
      );

      const timeline = await Promise.all(
        suggestion.timeline.map((t) =>
          tx.timelineEntry.create({
            data: {
              caseId,
              date: new Date(t.date),
              title: t.title,
              description: t.description ?? null,
            },
          }),
        ),
      );

      const witnesses = await Promise.all(
        suggestion.witnesses.map((w) =>
          tx.witness.create({
            data: {
              caseId,
              name: w.name,
              contact: w.contact ?? null,
              statement: w.statement ?? null,
            },
          }),
        ),
      );

      const damages = await Promise.all(
        suggestion.damages.map((d) =>
          tx.damages.create({
            data: {
              caseId,
              category: d.category,
              amount: d.amount,
              description: d.description ?? null,
            },
          }),
        ),
      );

      await tx.case.update({
        where: { id: caseId },
        data: { status: "FACTS" },
      });

      return {
        facts: facts.length,
        timeline: timeline.length,
        witnesses: witnesses.length,
        damages: damages.length,
      };
    });

    return NextResponse.json({
      suggestion,
      applied: created,
      transcriptId,
      documents: { total: documentCount, withExtractedText: withTextCount },
    });
  } catch (error) {
    if (error instanceof AiNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    console.error("Transcript analyze error:", error);
    return NextResponse.json(
      { error: "Failed to analyze transcript. Check AI settings and try again." },
      { status: 500 },
    );
  }
}
