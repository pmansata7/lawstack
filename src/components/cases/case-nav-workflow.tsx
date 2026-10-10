"use client";

import { usePathname } from "next/navigation";
import { CaseNav } from "@/components/cases/case-nav";
import { computeCaseWorkflowProgress } from "@/lib/cases/case-workflow-progress";

export function CaseNavWithWorkflow({
  caseId,
  caseTitle,
  claimCount,
  factsCount,
  evidenceCount,
  analysesCount,
  draftsCount,
  caseStatus,
}: {
  caseId: string;
  caseTitle: string;
  claimCount: number;
  factsCount: number;
  evidenceCount: number;
  analysesCount: number;
  draftsCount: number;
  caseStatus: string;
}) {
  const pathname = usePathname();
  const workflow = computeCaseWorkflowProgress({
    pathname,
    claimCount,
    factsCount,
    evidenceCount,
    analysesCount,
    draftsCount,
    caseStatus,
  });

  return (
    <CaseNav caseId={caseId} caseTitle={caseTitle} workflow={workflow} />
  );
}
