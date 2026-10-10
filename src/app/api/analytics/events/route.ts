import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { logAnalyticsEvent, type AnalyticsEventName } from "@/lib/analytics/log-event";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const name = body.name as AnalyticsEventName;
  if (!name) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  await logAnalyticsEvent(
    session.orgId,
    session.id,
    name,
    body.properties as Record<string, unknown> | undefined,
  );

  return NextResponse.json({ ok: true });
}
