import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; draftId: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, draftId } = await params;
  const { content, section } = await req.json();

  const caseData = await prisma.case.findFirst({
    where: { id, organizationId: session.orgId },
  });
  if (!caseData) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const comment = await prisma.comment.create({
    data: {
      draftId,
      userId: session.id,
      email: session.email,
      section: section ?? null,
      content,
    },
  });

  return NextResponse.json({ comment });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; draftId: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, draftId } = await params;
  const commentId = new URL(req.url).searchParams.get("id");

  const caseData = await prisma.case.findFirst({
    where: { id, organizationId: session.orgId },
  });
  if (!caseData) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const comment = await prisma.comment.findUnique({
    where: { id: commentId! },
  });
  if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

  await prisma.comment.update({
    where: { id: commentId! },
    data: { resolved: !comment.resolved },
  });

  return NextResponse.json({ success: true });
}
