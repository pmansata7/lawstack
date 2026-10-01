import type { SupabaseClient } from "@supabase/supabase-js";
import { provisionOrganizationForUser } from "@/lib/auth/provision-organization";

export async function provisionOrgForAuthenticatedUser(
  supabase: SupabaseClient,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return;

  const orgName = user.user_metadata?.org_name as string | undefined;
  if (!orgName) return;

  try {
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
