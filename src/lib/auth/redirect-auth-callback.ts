import { NextResponse, type NextRequest } from "next/server";

const AUTH_CALLBACK_QUERY_KEYS = [
  "code",
  "token_hash",
  "type",
  "error",
  "error_description",
] as const;

/**
 * Supabase sometimes redirects to Site URL (/) with ?code= instead of
 * /auth/callback. Forward those requests so the session can be exchanged.
 */
export function redirectRootAuthCallback(
  request: NextRequest,
): NextResponse | null {
  if (request.nextUrl.pathname !== "/") {
    return null;
  }

  const hasAuthQuery = AUTH_CALLBACK_QUERY_KEYS.some((key) =>
    request.nextUrl.searchParams.has(key),
  );
  if (!hasAuthQuery) {
    return null;
  }

  const url = request.nextUrl.clone();
  url.pathname = "/auth/callback";
  return NextResponse.redirect(url);
}
