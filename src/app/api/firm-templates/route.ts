import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import type { DraftType } from "@prisma/client";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const templates = await prisma.firmTemplate.findMany({
    where: { organizationId: session.orgId },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.name || !body.draftType) {
    return NextResponse.json({ error: "name and draftType required" }, { status: 400 });
  }

  const template = await prisma.firmTemplate.create({
    data: {
      organizationId: session.orgId,
      name: body.name,
      draftType: body.draftType as DraftType,
      jurisdiction: body.jurisdiction ?? null,
      sections: body.sections ?? [],
      boilerplate: body.boilerplate ?? null,
      isDefault: Boolean(body.isDefault),
    },
  });

  if (template.isDefault) {
    await prisma.firmTemplate.updateMany({
      where: {
        organizationId: session.orgId,
        draftType: template.draftType,
        id: { not: template.id },
      },
      data: { isDefault: false },
    });
  }

  return NextResponse.json({ template });
}
