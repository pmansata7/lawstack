import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const caseData = await prisma.case.findFirst({
    where: { id, organizationId: session.orgId },
  });
  if (!caseData) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const witness = await prisma.witness.create({
    data: {
      caseId: id,
      name: body.name,
      contact: body.contact ?? null,
      statement: body.statement ?? null,
      credibility: body.credibility ?? null,
    },
  });

  return NextResponse.json({ witness });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const witnessId = new URL(req.url).searchParams.get("id");

  const caseData = await prisma.case.findFirst({
    where: { id, organizationId: session.orgId },
  });
  if (!caseData) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.witness.delete({ where: { id: witnessId! } });
  return NextResponse.json({ success: true });
}
