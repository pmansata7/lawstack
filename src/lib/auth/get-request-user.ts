import type { User } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function getRequestUser(
  req: NextRequest,
  expectedUserId?: string,
): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();

  const authHeader = req.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const accessToken = authHeader.slice(7);
    const {
      data: { user },
    } = await supabase.auth.getUser(accessToken);
    if (user && (!expectedUserId || user.id === expectedUserId)) {
      return user;
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && (!expectedUserId || user.id === expectedUserId)) {
    return user;
  }

  return null;
}
