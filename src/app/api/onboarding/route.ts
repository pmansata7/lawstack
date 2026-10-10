import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  getWorkspaceOnboarding,
  updateWorkspaceOnboarding,
} from "@/lib/onboarding/workspace-onboarding";
import type { OnboardingStepId } from "@/lib/onboarding/state";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getWorkspaceOnboarding(session.id, session.orgId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Onboarding GET error:", error);
    return NextResponse.json(
      { error: "Failed to load onboarding" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const dismiss = Boolean(body.dismiss);
  const markStep = body.markStep as OnboardingStepId | undefined;

  try {
    const progress = await updateWorkspaceOnboarding(session.id, session.orgId, {
      dismiss,
      markStep,
    });
    const snapshot = await getWorkspaceOnboarding(session.id, session.orgId);
    return NextResponse.json({ ...snapshot, progress });
  } catch (error) {
    console.error("Onboarding PATCH error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update onboarding";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
