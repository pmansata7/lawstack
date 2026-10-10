import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const tasks = await prisma.caseTask.findMany({
    where: { caseId: id, case: { organizationId: session.orgId } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ tasks });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const caseExists = await prisma.case.findFirst({
    where: { id, organizationId: session.orgId },
    select: { id: true },
  });
  if (!caseExists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const task = await prisma.caseTask.create({
    data: {
      caseId: id,
      title: body.title,
      description: body.description ?? null,
      assigneeEmail: body.assigneeEmail ?? null,
      claimElement: body.claimElement ?? null,
      status: body.status ?? "OPEN",
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      createdByEmail: session.email,
    },
  });

  return NextResponse.json({ task });
}
