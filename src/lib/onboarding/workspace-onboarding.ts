import { prisma } from "@/lib/prisma";
import {
  buildOnboardingSteps,
  onboardingComplete,
  parseOnboardingProgress,
  type OnboardingProgress,
  type OnboardingStepView,
} from "@/lib/onboarding/state";

function hasEnvAiCredentials(): boolean {
  const provider = process.env.AI_PROVIDER ?? "openai";
  if (provider === "bedrock") {
    return Boolean(
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY,
    );
  }
  return Boolean(
    process.env.OPENAI_API_KEY ?? process.env.ANTHROPIC_API_KEY,
  );
}

export async function getWorkspaceOnboarding(
  userId: string,
  organizationId: string,
): Promise<{
  progress: OnboardingProgress;
  steps: OnboardingStepView[];
  showPanel: boolean;
}> {
  const member = await prisma.orgMember.findFirst({
    where: { userId, organizationId },
    select: { onboarding: true },
  });

  const progress = parseOnboardingProgress(member?.onboarding);

  const [aiSetting, caseAgg, orgCases] = await Promise.all([
    prisma.aiSetting.findUnique({
      where: { organizationId },
      select: { apiKey: true },
    }),
    prisma.case.aggregate({
      where: { organizationId },
      _count: { id: true },
    }),
    prisma.case.findMany({
      where: { organizationId },
      select: {
        id: true,
        _count: {
          select: {
            facts: true,
            evidence: true,
            analyses: true,
          },
        },
      },
      take: 50,
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const aiReady = Boolean(aiSetting?.apiKey) || hasEnvAiCredentials();
  const caseCount = caseAgg._count.id;
  const hasFactsOrEvidence = orgCases.some(
    (c) => c._count.facts > 0 || c._count.evidence > 0,
  );
  const hasAnalysis = orgCases.some((c) => c._count.analyses > 0);

  const steps = buildOnboardingSteps({
    aiReady,
    caseCount,
    hasFactsOrEvidence,
    hasAnalysis,
    manualSteps: progress.manualSteps,
  });

  const primaryCaseId = orgCases[0]?.id;
  if (primaryCaseId) {
    const factsHref = `/cases/${primaryCaseId}/facts`;
    const analysisHref = `/cases/${primaryCaseId}/analysis`;
    steps[2] = { ...steps[2], href: factsHref };
    steps[3] = { ...steps[3], href: analysisHref };
  }

  const showPanel =
    !progress.dismissedAt && !onboardingComplete(steps);

  return { progress, steps, showPanel };
}

export async function updateWorkspaceOnboarding(
  userId: string,
  organizationId: string,
  patch: {
    dismiss?: boolean;
    markStep?: keyof OnboardingProgress["manualSteps"];
  },
): Promise<OnboardingProgress> {
  const member = await prisma.orgMember.findFirst({
    where: { userId, organizationId },
    select: { id: true, onboarding: true },
  });

  if (!member) {
    throw new Error("Organization membership not found");
  }

  const current = parseOnboardingProgress(member.onboarding);
  const next: OnboardingProgress = {
    dismissedAt: patch.dismiss
      ? new Date().toISOString()
      : current.dismissedAt,
    manualSteps: { ...current.manualSteps },
  };

  if (patch.markStep) {
    next.manualSteps[patch.markStep] = true;
  }

  await prisma.orgMember.update({
    where: { id: member.id },
    data: { onboarding: next },
  });

  return next;
}
