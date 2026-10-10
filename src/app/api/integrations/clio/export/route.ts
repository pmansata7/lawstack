import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { logAnalyticsEvent } from "@/lib/analytics/log-event";

/** Stub: packages matter summary for Clio sync (OAuth not wired). */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const caseId = body.caseId as string;
  if (!caseId) {
    return NextResponse.json({ error: "caseId required" }, { status: 400 });
  }

  const caseData = await prisma.case.findFirst({
    where: { id: caseId, organizationId: session.orgId },
    include: {
      facts: { take: 20 },
      drafts: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!caseData) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const payload = {
    integration: "clio",
    status: "stub_ready",
    matter: {
      title: caseData.title,
      jurisdiction: caseData.jurisdiction,
      courtType: caseData.courtType,
      caseNumber: caseData.caseNumber,
      factCount: caseData.facts.length,
      latestDraftTitle: caseData.drafts[0]?.title ?? null,
    },
    message:
      "Clio OAuth is not configured. This payload is the shape Lawstack will POST once connected.",
  };

  await logAnalyticsEvent(session.orgId, session.id, "integration.export_stub", {
    integration: "clio",
    caseId,
  });

  return NextResponse.json(payload);
}
