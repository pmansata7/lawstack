import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AnalysisView } from "@/components/cases/analysis-view";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { WorkflowTooltip } from "@/components/cases/workflow-tooltips";

export default async function AnalysisPage({
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
      facts: true,
      evidence: true,
      timeline: { orderBy: { date: "asc" } },
      witnesses: true,
      damages: true,
      analyses: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!caseData) notFound();

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            AI Legal Analysis
            <WorkflowTooltip step="analysis" />
          </h1>
          <p className="text-muted-foreground">
            Map facts to legal elements and identify potential vulnerabilities.
          </p>
        </div>
        {caseData.analyses.length > 0 && (
          <Button asChild>
            <Link href={`/cases/${id}/draft`}>
              Continue to Draft
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      <AnalysisView caseId={id} caseData={caseData} />
    </div>
  );
}
