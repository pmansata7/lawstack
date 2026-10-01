import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/get-request-user";
import { provisionOrganizationForUser } from "@/lib/auth/provision-organization";

export async function POST(req: NextRequest) {
  try {
    const { userId, email, orgName, orgType } = await req.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const user = await getRequestUser(req, userId);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedOrgName =
      orgName ?? (user.user_metadata?.org_name as string | undefined);

    if (!resolvedOrgName) {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 },
      );
    }

    const resolvedOrgType =
      orgType ?? (user.user_metadata?.org_type as string | undefined);

    const resolvedEmail = user.email ?? email;

    const result = await provisionOrganizationForUser({
      userId,
      email: resolvedEmail,
      orgName: resolvedOrgName,
      orgType: resolvedOrgType,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 },
    );
  }
}
