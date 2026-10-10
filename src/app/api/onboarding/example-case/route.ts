import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createExampleCaseForOrganization } from "@/lib/cases/create-example-case";
import { updateWorkspaceOnboarding } from "@/lib/onboarding/workspace-onboarding";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { caseId, title } = await createExampleCaseForOrganization(
      session.orgId,
    );
    await updateWorkspaceOnboarding(session.id, session.orgId, {
      markStep: "open_matter",
    });
    return NextResponse.json({ caseId, title });
  } catch (error) {
    console.error("Example case error:", error);
    return NextResponse.json(
      { error: "Failed to create example matter" },
      { status: 500 },
    );
  }
}
