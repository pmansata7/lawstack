import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { prisma } from "@/lib/prisma";

export interface SessionUser {
  id: string;
  email: string;
  orgId: string;
  orgName: string;
  orgType: string;
  role: string;
}

export async function getSession(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("getSession auth error:", authError);
      return null;
    }

    if (!user) return null;

    const member = await prisma.orgMember.findFirst({
      where: { userId: user.id },
      include: { organization: true },
    });

    if (!member) return null;

    return {
      id: user.id,
      email: user.email ?? member.email,
      orgId: member.organizationId,
      orgName: member.organization.name,
      orgType: member.organization.type,
      role: member.role,
    };
  } catch (error) {
    console.error("getSession error:", error);
    return null;
  }
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
