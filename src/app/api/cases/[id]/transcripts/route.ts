import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getCaseForOrganization } from "@/lib/cases/get-case-for-org";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const caseData = await getCaseForOrganization(id, session.orgId);
  if (!caseData) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const transcripts = await prisma.caseTranscript.findMany({
    where: { caseId: id },
    orderBy: [{ recordedAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      source: true,
      status: true,
      summary: true,
      recordedAt: true,
      externalId: true,
      createdAt: true,
      content: true,
    },
  });

  return NextResponse.json({
    transcripts: transcripts.map((t) => ({
      ...t,
      preview: t.content.slice(0, 280),
      content: undefined,
    })),
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const transcriptId = new URL(req.url).searchParams.get("transcriptId");
  if (!transcriptId) {
    return NextResponse.json({ error: "transcriptId required" }, { status: 400 });
  }

  const caseData = await getCaseForOrganization(id, session.orgId);
  if (!caseData) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.caseTranscript.deleteMany({
    where: { id: transcriptId, caseId: id },
  });

  return NextResponse.json({ success: true });
}
