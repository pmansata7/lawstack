import type { FactsIntakeSuggestion } from "@/lib/ai/intake-schemas";
import { prisma } from "@/lib/prisma";

export async function applyFactsIntakeSuggestion(
  caseId: string,
  suggestion: FactsIntakeSuggestion,
) {
  return prisma.$transaction(async (tx) => {
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
            source: f.source ?? null,
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
}
