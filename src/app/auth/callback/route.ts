import { NextRequest, NextResponse } from "next/server";
import { provisionOrganizationForUser } from "@/lib/auth/provision-organization";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        const orgName = user.user_metadata?.org_name as string | undefined;
        if (orgName) {
          try {
            await provisionOrganizationForUser({
              userId: user.id,
              email: user.email,
              orgName,
              orgType: user.user_metadata?.org_type as string | undefined,
            });
          } catch (provisionError) {
            console.error("Auth callback org provision error:", provisionError);
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
