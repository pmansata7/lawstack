import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.firmTemplate.findFirst({
    where: { id, organizationId: session.orgId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const template = await prisma.firmTemplate.update({
    where: { id },
    data: {
      name: body.name ?? existing.name,
      jurisdiction: body.jurisdiction ?? existing.jurisdiction,
      sections: body.sections ?? existing.sections,
      boilerplate: body.boilerplate ?? existing.boilerplate,
      isDefault: body.isDefault ?? existing.isDefault,
    },
  });

  return NextResponse.json({ template });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.firmTemplate.findFirst({
    where: { id, organizationId: session.orgId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.firmTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
