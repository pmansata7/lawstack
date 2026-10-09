import { NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { provisionOrgForAuthenticatedUser } from "@/lib/auth/complete-auth-session";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

function safeNextPath(
  next: string | null,
  fallback: string,
): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }
  return next;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const defaultNext =
    type === "recovery" ? "/auth/update-password" : "/dashboard";
  const next = safeNextPath(searchParams.get("next"), defaultNext);
  const authError =
    searchParams.get("error_description") ?? searchParams.get("error");

  const loginRedirect = () => {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "auth");
    if (authError) {
      loginUrl.searchParams.set("message", authError);
    }
    return NextResponse.redirect(loginUrl);
  };

  if (authError) {
    return loginRedirect();
  }

  if (!isSupabaseConfigured()) {
    const configUrl = new URL("/login", request.url);
    configUrl.searchParams.set("error", "config");
    return NextResponse.redirect(configUrl);
  }

  if (!code && !(tokenHash && type)) {
    return loginRedirect();
  }

  const successRedirect = NextResponse.redirect(new URL(next, request.url));
  const supabase = createSupabaseRouteHandlerClient(request, successRedirect);

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Auth callback code exchange error:", error);
      return loginRedirect();
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (error) {
      console.error("Auth callback verifyOtp error:", error);
      return loginRedirect();
    }
  }

  await provisionOrgForAuthenticatedUser(supabase);
  return successRedirect;
}
