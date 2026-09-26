import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, email, fullName, orgName, orgType } = await req.json();

    if (!userId || !email || !orgName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create organization
    const org = await prisma.organization.create({
      data: {
        name: orgName,
        type: orgType ?? "LAW_FIRM",
      },
    });

    // Create org member as owner
    await prisma.orgMember.create({
      data: {
        organizationId: org.id,
        userId,
        email,
        role: "OWNER",
      },
    });

    // Create default AI settings
    await prisma.aiSetting.create({
      data: {
        organizationId: org.id,
      },
    });

    return NextResponse.json({ orgId: org.id });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 },
    );
  }
}
