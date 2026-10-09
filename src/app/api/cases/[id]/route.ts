import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session-from-request";
import { deleteCaseForOrganization } from "@/lib/cases/delete-case";
import { prisma } from "@/lib/prisma";

const ROLES_CAN_DELETE = new Set(["OWNER", "ADMIN", "ATTORNEY", "PARALEGAL"]);

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!ROLES_CAN_DELETE.has(session.role)) {
      return NextResponse.json(
        { error: "You do not have permission to delete cases" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const confirmTitle =
      typeof body.confirmTitle === "string" ? body.confirmTitle.trim() : "";

    const caseRow = await prisma.case.findFirst({
      where: { id, organizationId: session.orgId },
      select: { title: true },
    });
    if (!caseRow) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (!confirmTitle || confirmTitle !== caseRow.title) {
      return NextResponse.json(
        { error: "Type the exact case title to confirm deletion" },
        { status: 400 },
      );
    }

    const deleted = await deleteCaseForOrganization(id, session.orgId);
    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete case error:", error);
    return NextResponse.json(
      { error: "Failed to delete case" },
      { status: 500 },
    );
  }
}
