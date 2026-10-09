import type { SupabaseClient } from "@supabase/supabase-js";
import { provisionOrganizationForUser } from "@/lib/auth/provision-organization";
import { prisma } from "@/lib/prisma";

function defaultOrgNameForUser(
  email: string,
  metadata: Record<string, unknown> | undefined,
): string {
  const fromMeta = metadata?.org_name;
  if (typeof fromMeta === "string" && fromMeta.trim()) {
    return fromMeta.trim();
  }

  const fullName = metadata?.full_name;
  if (typeof fullName === "string" && fullName.trim()) {
    return `${fullName.trim()}'s Organization`;
  }

  const local = email.split("@")[0]?.trim();
  if (local) {
    return `${local}'s Organization`;
  }

  return "My Organization";
}

export async function provisionOrgForAuthenticatedUser(
  supabase: SupabaseClient,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return;

  try {
    const existing = await prisma.orgMember.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });
    if (existing) return;

    const orgName = defaultOrgNameForUser(
      user.email,
      user.user_metadata as Record<string, unknown> | undefined,
    );

    await provisionOrganizationForUser({
      userId: user.id,
      email: user.email,
      orgName,
      orgType: user.user_metadata?.org_type as string | undefined,
    });
  } catch (provisionError) {
    console.error("Auth org provision error:", provisionError);
  }
}
