import { prisma } from "@/lib/prisma";
import type { OrgType } from "@prisma/client";

const VALID_ORG_TYPES = new Set<string>(["LAW_FIRM", "IN_HOUSE", "COURT"]);

function normalizeOrgType(orgType: string | undefined): OrgType {
  if (orgType && VALID_ORG_TYPES.has(orgType)) {
    return orgType as OrgType;
  }
  return "LAW_FIRM";
}

export async function provisionOrganizationForUser({
  userId,
  email,
  orgName,
  orgType,
}: {
  userId: string;
  email: string;
  orgName: string;
  orgType?: string;
}) {
  const existing = await prisma.orgMember.findFirst({
    where: { userId },
    select: { organizationId: true },
  });

  if (existing) {
    return { orgId: existing.organizationId, created: false as const };
  }

  const org = await prisma.organization.create({
    data: {
      name: orgName,
      type: normalizeOrgType(orgType),
    },
  });

  await prisma.orgMember.create({
    data: {
      organizationId: org.id,
      userId,
      email,
      role: "OWNER",
    },
  });

  await prisma.aiSetting.create({
    data: {
      organizationId: org.id,
    },
  });

  return { orgId: org.id, created: true as const };
}
