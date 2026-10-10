export type OnboardingStepId =
  | "configure_ai"
  | "open_matter"
  | "build_record"
  | "run_analysis";

export type OnboardingProgress = {
  dismissedAt: string | null;
  manualSteps: Partial<Record<OnboardingStepId, boolean>>;
};

export const EMPTY_ONBOARDING: OnboardingProgress = {
  dismissedAt: null,
  manualSteps: {},
};

export function parseOnboardingProgress(raw: unknown): OnboardingProgress {
  if (!raw || typeof raw !== "object") {
    return { ...EMPTY_ONBOARDING };
  }
  const record = raw as Record<string, unknown>;
  const manualSteps =
    record.manualSteps && typeof record.manualSteps === "object"
      ? (record.manualSteps as Partial<Record<OnboardingStepId, boolean>>)
      : {};
  return {
    dismissedAt:
      typeof record.dismissedAt === "string" ? record.dismissedAt : null,
    manualSteps,
  };
}

export type OnboardingStepView = {
  id: OnboardingStepId;
  title: string;
  description: string;
  href: string;
  done: boolean;
};

export function buildOnboardingSteps(input: {
  aiReady: boolean;
  caseCount: number;
  hasFactsOrEvidence: boolean;
  hasAnalysis: boolean;
  manualSteps: Partial<Record<OnboardingStepId, boolean>>;
}): OnboardingStepView[] {
  const openMatterDone =
    input.caseCount > 0 || Boolean(input.manualSteps.open_matter);
  const buildRecordDone =
    input.hasFactsOrEvidence || Boolean(input.manualSteps.build_record);
  const runAnalysisDone =
    input.hasAnalysis || Boolean(input.manualSteps.run_analysis);

  return [
    {
      id: "configure_ai",
      title: "Connect AI",
      description:
        "Add your firm’s API key or use server env keys so intake, analysis, and drafting can run.",
      href: "/settings/ai",
      done: input.aiReady || Boolean(input.manualSteps.configure_ai),
    },
    {
      id: "open_matter",
      title: "Open a matter",
      description:
        "Start from a short narrative with AI intake, or load the example Smith v. Acme matter.",
      href: "/dashboard/cases/new",
      done: openMatterDone,
    },
    {
      id: "build_record",
      title: "Build the record",
      description:
        "Add facts, uploads, timeline, witnesses, and damages—then map them to claim elements.",
      href: input.caseCount > 0 ? "/dashboard" : "/dashboard/cases/new",
      done: buildRecordDone,
    },
    {
      id: "run_analysis",
      title: "Stress-test the theory",
      description:
        "Run legal analysis to surface element gaps, dismissal risk, and procedural checklist items.",
      href: "/dashboard",
      done: runAnalysisDone,
    },
  ];
}

export function onboardingComplete(steps: OnboardingStepView[]): boolean {
  return steps.every((s) => s.done);
}
