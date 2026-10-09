import { NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { provisionOrgForAuthenticatedUser } from "@/lib/auth/complete-auth-session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const defaultNext =
    type === "recovery" ? "/auth/update-password" : "/dashboard";
  const next = searchParams.get("next") ?? defaultNext;
  const authError =
    searchParams.get("error_description") ?? searchParams.get("error");

  if (authError) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("error", "auth");
    loginUrl.searchParams.set("message", authError);
    return NextResponse.redirect(loginUrl);
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/login?error=config`);
  }

  const supabase = await createSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Auth callback code exchange error:", error);
      return NextResponse.redirect(`${origin}/login?error=auth`);
    }

    await provisionOrgForAuthenticatedUser(supabase);
    return NextResponse.redirect(`${origin}${next}`);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (error) {
      console.error("Auth callback verifyOtp error:", error);
      return NextResponse.redirect(`${origin}/login?error=auth`);
    }

    await provisionOrgForAuthenticatedUser(supabase);
    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
