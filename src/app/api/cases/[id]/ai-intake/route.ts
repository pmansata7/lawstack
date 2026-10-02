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

    const evidenceList = includeDocuments
      ? await prisma.evidence.findMany({
          where: { caseId: id },
          orderBy: { createdAt: "asc" },
        })
      : [];

    const hasDocuments = evidenceList.length > 0;
    if (narrative.length < 20 && !hasDocuments) {
      return NextResponse.json(
        {
          error:
            "Add a short description (20+ characters) or upload at least one document for AI to analyze.",
        },
        { status: 400 },
      );
    }

    const provider = await getAiProviderForOrganization(
      session.orgId,
      null,
    );

    const { context: documentContext, documentCount, withTextCount } =
      await buildEvidenceContextForFactsIntake(evidenceList, provider);

    const result = await provider.generateCompletion(
      [
        { role: "system", content: buildFactsIntakeSystemPrompt() },
        {
          role: "user",
          content: buildFactsIntakeUserPrompt(narrative, {
            title: caseData.title,
            courtType: caseData.courtType,
            jurisdiction: caseData.jurisdiction,
            plaintiff: caseData.plaintiff,
            defendant: caseData.defendant,
            claims: caseData.claims.map((c) => c.claimType),
          }, documentContext),
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
        documents: { total: documentCount, withExtractedText: withTextCount },
      });
    }

    const created = await prisma.$transaction(async (tx) => {
      const facts = await Promise.all(
        suggestion.facts.map((f) =>
          tx.fact.create({
            data: {
              caseId: id,
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
              source: f.source ?? null,
            },
          }),
        ),
      );

      const timeline = await Promise.all(
        suggestion.timeline.map((t) =>
          tx.timelineEntry.create({
            data: {
              caseId: id,
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
              caseId: id,
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
              caseId: id,
              category: d.category,
              amount: d.amount,
              description: d.description ?? null,
            },
          }),
        ),
      );

      await tx.case.update({
        where: { id },
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
      documents: { total: documentCount, withExtractedText: withTextCount },
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
