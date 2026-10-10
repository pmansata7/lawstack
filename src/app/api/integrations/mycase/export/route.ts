import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { logAnalyticsEvent } from "@/lib/analytics/log-event";

/** Stub: packages matter summary for MyCase sync. */
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
    include: { drafts: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!caseData) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const payload = {
    integration: "mycase",
    status: "stub_ready",
    caseFile: {
      name: caseData.title,
      practiceArea: "Civil Litigation",
      draftDocument: caseData.drafts[0]?.title ?? null,
    },
    message: "MyCase API credentials not configured. Export stub only.",
  };

  await logAnalyticsEvent(session.orgId, session.id, "integration.export_stub", {
    integration: "mycase",
    caseId,
  });

  return NextResponse.json(payload);
}
