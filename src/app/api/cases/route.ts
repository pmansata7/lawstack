import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, courtType, jurisdiction, courtName, caseNumber, plaintiff, defendant, opposingParty, claims } = body;

    if (!title || !jurisdiction) {
      return NextResponse.json(
        { error: "Title and jurisdiction are required" },
        { status: 400 },
      );
    }

    const newCase = await prisma.case.create({
      data: {
        organizationId: session.orgId,
        title,
        courtType: courtType ?? "FEDERAL",
        jurisdiction,
        courtName,
        caseNumber,
        plaintiff,
        defendant,
        opposingParty,
        status: "FACTS",
        claims: {
          create: claims?.map((c: { claimType: string; jurisdiction: string; elements: unknown }) => ({
            claimType: c.claimType,
            jurisdiction: c.jurisdiction,
            elements: c.elements,
          })) ?? [],
        },
      },
      include: { claims: true },
    });

    return NextResponse.json({ caseId: newCase.id, case: newCase });
  } catch (error) {
    console.error("Create case error:", error);
    return NextResponse.json(
      { error: "Failed to create case" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cases = await prisma.case.findMany({
      where: { organizationId: session.orgId },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { facts: true, evidence: true, drafts: true },
        },
      },
    });

    return NextResponse.json({ cases });
  } catch (error) {
    console.error("Get cases error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 },
    );
  }
}
