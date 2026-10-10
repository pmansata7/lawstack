import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { runAdaptiveIntakeTurn } from "@/lib/adaptive-intake/service";
import { logAnalyticsEvent } from "@/lib/analytics/log-event";
import { AiNotConfiguredError } from "@/lib/ai/org-provider";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const sessionRow = await prisma.intakeSession.findFirst({
    where: { caseId: id, case: { organizationId: session.orgId } },
  });

  return NextResponse.json({ session: sessionRow });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  try {
    const result = await runAdaptiveIntakeTurn(id, session.orgId, {
      narrative: body.narrative as string | undefined,
      answer: body.answer as { questionId: string; answer: string } | undefined,
    });

    await logAnalyticsEvent(
      session.orgId,
      session.id,
      body.answer ? "intake.question_answered" : "intake.session_started",
      { caseId: id },
    );

    if (result.complete) {
      await logAnalyticsEvent(session.orgId, session.id, "intake.session_completed", {
        caseId: id,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AiNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    if (error instanceof Error && error.message === "Case not found") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("Adaptive intake error:", error);
    return NextResponse.json({ error: "Intake failed" }, { status: 500 });
  }
}
