import { prisma } from "@/lib/prisma";
import {
  buildAdaptiveAnswerMergePrompt,
  buildAdaptiveIntakeSystemPrompt,
  buildAdaptiveIntakeUserPrompt,
} from "@/lib/ai/adaptive-intake-prompts";
import {
  getDefendantIntakeQuestions,
  getIntakeQuestionsForClaims,
} from "@/lib/legal/intake-requirements";
import { parseAiJson, resolveOrgAiProvider } from "@/lib/drafting/resolve-ai-provider";

type SessionMessage = { role: "user" | "assistant" | "system"; content: string };

export async function getOrCreateIntakeSession(caseId: string) {
  const existing = await prisma.intakeSession.findUnique({ where: { caseId } });
  if (existing) return existing;
  return prisma.intakeSession.create({
    data: { caseId, messages: [], phase: "active" },
  });
}

export async function runAdaptiveIntakeTurn(
  caseId: string,
  organizationId: string,
  input: { narrative?: string; answer?: { questionId: string; answer: string } },
) {
  const caseData = await prisma.case.findFirst({
    where: { id: caseId, organizationId },
    include: { claims: true, facts: true },
  });
  if (!caseData) throw new Error("Case not found");

  const session = await getOrCreateIntakeSession(caseId);
  const messages = (session.messages as SessionMessage[]) ?? [];
  const coverage = (session.coverage as { answeredQuestionIds?: string[] }) ?? {};
  const answeredIds = coverage.answeredQuestionIds ?? [];

  const claimTypes = caseData.claims.map((c) => c.claimType);
  const catalog =
    caseData.partyRole === "DEFENDANT"
      ? getDefendantIntakeQuestions()
      : getIntakeQuestionsForClaims(claimTypes);

  const provider = await resolveOrgAiProvider(organizationId);

  if (input.answer) {
    const question = catalog.find((q) => q.id === input.answer!.questionId);
    messages.push({
      role: "user",
      content: `Q (${input.answer.questionId}): ${question?.prompt ?? input.answer.questionId}\nA: ${input.answer.answer}`,
    });

    const mergeResult = await provider.generateCompletion(
      [
        { role: "system", content: "Return strict JSON only." },
        {
          role: "user",
          content: buildAdaptiveAnswerMergePrompt({
            questionId: input.answer.questionId,
            question: question?.prompt ?? input.answer.questionId,
            answer: input.answer.answer,
            existingFacts: caseData.facts.map((f) => f.statement),
          }),
        },
      ],
      { temperature: 0.2, maxTokens: 2048 },
    );

    const merged = parseAiJson(mergeResult.content) as {
      factsToAdd?: Array<{ statement: string; category: string }>;
      timelineToAdd?: Array<{ date: string | null; title: string; description: string }>;
    };

    if (merged.factsToAdd?.length) {
      await prisma.fact.createMany({
        data: merged.factsToAdd.map((f) => ({
          caseId,
          statement: f.statement,
          category: f.category as "INCIDENT" | "BACKGROUND" | "DAMAGES" | "PROCEDURAL" | "OTHER",
        })),
      });
    }
    if (merged.timelineToAdd?.length) {
      await prisma.timelineEntry.createMany({
        data: merged.timelineToAdd.map((t) => ({
          caseId,
          date: t.date ? new Date(t.date) : new Date(),
          title: t.title,
          description: t.description,
        })),
      });
    }

    if (!answeredIds.includes(input.answer.questionId)) {
      answeredIds.push(input.answer.questionId);
    }
  }

  const narrative =
    input.narrative ??
    messages.find((m) => m.role === "user" && m.content.startsWith("Narrative:"))?.content?.replace(/^Narrative:\s*/, "") ??
    caseData.facts.map((f) => f.statement).join(" ");

  if (input.narrative) {
    messages.push({ role: "user", content: `Narrative: ${input.narrative}` });
  }

  const result = await provider.generateCompletion(
    [
      {
        role: "system",
        content: buildAdaptiveIntakeSystemPrompt(caseData.partyRole),
      },
      {
        role: "user",
        content: buildAdaptiveIntakeUserPrompt({
          caseTitle: caseData.title,
          jurisdiction: caseData.jurisdiction,
          claimTypes,
          narrative,
          priorMessages: messages,
          questionCatalog: catalog,
          answeredIds,
        }),
      },
    ],
    { temperature: 0.3, maxTokens: 3072 },
  );

  const parsed = parseAiJson(result.content) as {
    complete?: boolean;
    coverage?: { answeredQuestionIds?: string[]; missingCategories?: string[] };
    nextQuestions?: Array<{ id: string; prompt: string; whyItMatters: string }>;
    suggestedFacts?: Array<{ statement: string; category: string }>;
    evidenceRequests?: Array<{ title: string; reason: string }>;
  };

  const nextCoverage = {
    answeredQuestionIds: [
      ...new Set([...answeredIds, ...(parsed.coverage?.answeredQuestionIds ?? [])]),
    ],
    missingCategories: parsed.coverage?.missingCategories ?? [],
  };

  if (parsed.suggestedFacts?.length) {
    await prisma.fact.createMany({
      data: parsed.suggestedFacts.map((f) => ({
        caseId,
        statement: f.statement,
        category: f.category as "INCIDENT" | "BACKGROUND" | "DAMAGES" | "PROCEDURAL" | "OTHER",
      })),
    });
  }

  const phase = parsed.complete ? "complete" : "active";
  const updated = await prisma.intakeSession.update({
    where: { caseId },
    data: {
      messages,
      pendingQuestions: parsed.nextQuestions ?? [],
      coverage: nextCoverage,
      phase,
    },
  });

  return {
    session: updated,
    complete: Boolean(parsed.complete),
    nextQuestions: parsed.nextQuestions ?? [],
    evidenceRequests: parsed.evidenceRequests ?? [],
  };
}
