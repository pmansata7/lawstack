export type CaseWorkflowStepId =
  | "setup"
  | "facts"
  | "analysis"
  | "draft"
  | "review";

export type CaseWorkflowStepState = "complete" | "current" | "upcoming";

export type CaseWorkflowProgress = Record<
  CaseWorkflowStepId,
  CaseWorkflowStepState
>;

const STEP_ORDER: CaseWorkflowStepId[] = [
  "setup",
  "facts",
  "analysis",
  "draft",
  "review",
];

export function computeCaseWorkflowProgress(input: {
  pathname: string;
  claimCount: number;
  factsCount: number;
  evidenceCount: number;
  analysesCount: number;
  draftsCount: number;
  caseStatus: string;
}): CaseWorkflowProgress {
  const completed: Record<CaseWorkflowStepId, boolean> = {
    setup: input.claimCount > 0,
    facts: input.factsCount >= 3 || input.evidenceCount >= 1,
    analysis: input.analysesCount > 0,
    draft: input.draftsCount > 0,
    review:
      input.draftsCount > 0 &&
      (input.caseStatus === "REVIEW" || input.caseStatus === "FILED"),
  };

  const activeStep =
    STEP_ORDER.find((step) => input.pathname.includes(`/${step}`)) ?? "setup";

  const progress = {} as CaseWorkflowProgress;
  for (const step of STEP_ORDER) {
    if (completed[step]) {
      progress[step] = "complete";
    } else if (step === activeStep) {
      progress[step] = "current";
    } else {
      progress[step] = "upcoming";
    }
  }

  return progress;
}
