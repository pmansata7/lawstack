import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, taskId } = await params;
  const body = await req.json();

  const existing = await prisma.caseTask.findFirst({
    where: { id: taskId, caseId: id, case: { organizationId: session.orgId } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const task = await prisma.caseTask.update({
    where: { id: taskId },
    data: {
      title: body.title ?? existing.title,
      description: body.description ?? existing.description,
      assigneeEmail: body.assigneeEmail ?? existing.assigneeEmail,
      claimElement: body.claimElement ?? existing.claimElement,
      status: body.status ?? existing.status,
      dueDate:
        body.dueDate === null
          ? null
          : body.dueDate
            ? new Date(body.dueDate)
            : existing.dueDate,
    },
  });

  return NextResponse.json({ task });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, taskId } = await params;

  const existing = await prisma.caseTask.findFirst({
    where: { id: taskId, caseId: id, case: { organizationId: session.orgId } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.caseTask.delete({ where: { id: taskId } });
  return NextResponse.json({ ok: true });
}
