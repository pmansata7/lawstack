import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  createCaseWithClaims,
  getCreateCaseErrorMessage,
  type CreateCaseClaimInput,
} from "@/lib/cases/create-case";

function parseClaims(raw: unknown): CreateCaseClaimInput[] | null {
  if (raw === undefined || raw === null) {
    return [];
  }
  if (!Array.isArray(raw)) {
    return null;
  }
  return raw as CreateCaseClaimInput[];
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      courtType,
      jurisdiction,
      courtName,
      caseNumber,
      plaintiff,
      defendant,
      opposingParty,
      claims: rawClaims,
    } = body;

    if (!title?.trim() || !jurisdiction) {
      return NextResponse.json(
        { error: "Title and jurisdiction are required" },
        { status: 400 },
      );
    }

    const claims = parseClaims(rawClaims);
    if (claims === null) {
      return NextResponse.json(
        { error: "Claims must be an array" },
        { status: 400 },
      );
    }

    if (courtType && courtType !== "STATE" && courtType !== "FEDERAL") {
      return NextResponse.json(
        { error: "Invalid court type" },
        { status: 400 },
      );
    }

    const newCase = await createCaseWithClaims({
      organizationId: session.orgId,
      title,
      courtType,
      jurisdiction,
      courtName,
      caseNumber,
      plaintiff,
      defendant,
      opposingParty,
      claims,
    });

    return NextResponse.json({ caseId: newCase.id, case: newCase });
  } catch (error) {
    console.error("Create case error:", error);
    return NextResponse.json(
      { error: getCreateCaseErrorMessage(error) },
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
