import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; claimId: string }> },
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, claimId } = await params;
  const { elementIndex } = await req.json();

  const caseData = await prisma.case.findFirst({
    where: { id, organizationId: session.orgId },
  });
  if (!caseData) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const claim = await prisma.claim.findUnique({
    where: { id: claimId },
  });
  if (!claim || claim.caseId !== id) {
    return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  }

  const elements = claim.elements as Array<{
    element: string;
    description: string;
    satisfied: boolean;
  }>;

  if (elementIndex < 0 || elementIndex >= elements.length) {
    return NextResponse.json({ error: "Invalid element index" }, { status: 400 });
  }

  elements[elementIndex].satisfied = !elements[elementIndex].satisfied;

  await prisma.claim.update({
    where: { id: claimId },
    data: { elements },
  });

  return NextResponse.json({ success: true, elements });
}
