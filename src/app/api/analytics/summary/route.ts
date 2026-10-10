import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const events = await prisma.analyticsEvent.groupBy({
    by: ["name"],
    where: {
      organizationId: session.orgId,
      createdAt: { gte: since },
    },
    _count: { name: true },
  });

  const casesCreated = await prisma.case.count({
    where: { organizationId: session.orgId, createdAt: { gte: since } },
  });

  const draftsGenerated = events.find((e) => e.name === "draft.generated")?._count.name ?? 0;
  const analysesRun = events.find((e) => e.name === "analysis.run")?._count.name ?? 0;
  const intakeCompleted =
    events.find((e) => e.name === "intake.session_completed")?._count.name ?? 0;

  return NextResponse.json({
    periodDays: 30,
    casesCreated,
    draftsGenerated,
    analysesRun,
    intakeCompleted,
    events: events.map((e) => ({ name: e.name, count: e._count.name })),
  });
}
