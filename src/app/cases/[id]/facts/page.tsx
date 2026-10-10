import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { FactsTabs } from "@/components/cases/facts-tabs";
import { AdaptiveIntakePanel } from "@/components/cases/adaptive-intake-panel";
import { SmallClaimsGuide } from "@/components/cases/small-claims-guide";
import { WorkflowTooltip } from "@/components/cases/workflow-tooltips";
import { CaseTasksPanel } from "@/components/cases/case-tasks-panel";

export default async function FactsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) return null;
  const { id } = await params;

  const caseData = await prisma.case.findFirst({
    where: { id, organizationId: session.orgId },
    include: {
      claims: true,
      facts: { orderBy: { createdAt: "desc" } },
      evidence: { orderBy: { createdAt: "desc" } },
      transcripts: { orderBy: [{ recordedAt: "desc" }, { createdAt: "desc" }] },
      timeline: { orderBy: { date: "asc" } },
      witnesses: { orderBy: { createdAt: "desc" } },
      damages: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!caseData) notFound();

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            Facts & Evidence
            <WorkflowTooltip step="facts" />
          </h1>
          <p className="text-muted-foreground">
            Capture and structure key facts with supporting evidence.
          </p>
        </div>
      </div>

      <SmallClaimsGuide
        caseId={id}
        jurisdiction={caseData.jurisdiction}
        guided={caseData.guidedSmallClaims}
      />
      <AdaptiveIntakePanel caseId={id} />
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FactsTabs caseId={id} initialData={caseData} />
        </div>
        <CaseTasksPanel caseId={id} />
      </div>
    </div>
  );
}
