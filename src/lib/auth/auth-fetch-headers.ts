import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export async function getAuthFetchHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  try {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch {
    // Fall back to cookie-based auth on the server
  }

  return headers;
}
