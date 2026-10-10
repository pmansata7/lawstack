import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type AnalyticsEventName =
  | "onboarding.step_completed"
  | "onboarding.dismissed"
  | "case.created"
  | "case.example_loaded"
  | "intake.session_started"
  | "intake.question_answered"
  | "intake.session_completed"
  | "analysis.run"
  | "draft.generated"
  | "draft.review_run"
  | "draft.exported"
  | "integration.export_stub"
  | "eval.run";

export async function logAnalyticsEvent(
  organizationId: string,
  userId: string,
  name: AnalyticsEventName,
  properties?: Record<string, unknown>,
): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        organizationId,
        userId,
        name,
        properties: (properties ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (error) {
    console.warn("Analytics event skipped:", name, error);
  }
}
