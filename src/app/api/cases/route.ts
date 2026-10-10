import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session-from-request";
import { prisma } from "@/lib/prisma";
import type { CaseCourtType } from "@/lib/legal/claim-templates";
import {
  createCaseWithClaims,
  getCreateCaseErrorMessage,
  type CreateCaseClaimInput,
} from "@/lib/cases/create-case";
import { updateWorkspaceOnboarding } from "@/lib/onboarding/workspace-onboarding";

function parseClaims(raw: unknown): CreateCaseClaimInput[] | null {
  if (raw === undefined || raw === null) {
    return [];
  }
  if (!Array.isArray(raw)) {
    return null;
  }
  return raw as CreateCaseClaimInput[];
}

const VALID_COURT_TYPES = new Set<string>(["STATE", "FEDERAL", "SMALL_CLAIMS"]);

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        {
          error:
            "Unauthorized. Sign in again, or finish account setup if you just confirmed your email.",
        },
        { status: 401 },
      );
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

    if (courtType && !VALID_COURT_TYPES.has(courtType)) {
      return NextResponse.json(
        { error: "Invalid court type" },
        { status: 400 },
      );
    }

    const newCase = await createCaseWithClaims({
      organizationId: session.orgId,
      title,
      courtType: courtType as CaseCourtType | undefined,
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

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
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
