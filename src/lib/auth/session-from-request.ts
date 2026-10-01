import type { NextRequest } from "next/server";
import { getRequestUser } from "@/lib/auth/get-request-user";
import { provisionOrganizationForUser } from "@/lib/auth/provision-organization";
import type { SessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

async function memberToSession(
  userId: string,
  email: string,
): Promise<SessionUser | null> {
  const member = await prisma.orgMember.findFirst({
    where: { userId },
    include: { organization: true },
  });

  if (!member) return null;

  return {
    id: userId,
    email,
    orgId: member.organizationId,
    orgName: member.organization.name,
    orgType: member.organization.type,
    role: member.role,
  };
}

export async function getSessionFromRequest(
  req: NextRequest,
): Promise<SessionUser | null> {
  const user = await getRequestUser(req);
  if (!user?.email) return null;

  let session = await memberToSession(user.id, user.email);
  if (session) return session;

  const orgName = user.user_metadata?.org_name as string | undefined;
  if (!orgName) return null;

  try {
    await provisionOrganizationForUser({
      userId: user.id,
      email: user.email,
      orgName,
      orgType: user.user_metadata?.org_type as string | undefined,
    });
  } catch (error) {
    console.error("getSessionFromRequest org provision error:", error);
    return null;
  }

  return memberToSession(user.id, user.email);
}
