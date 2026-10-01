/**
 * Supabase Transaction pooler (PgBouncer, port 6543) requires `pgbouncer=true`
 * so Prisma disables prepared statements. Without it, Postgres returns 42P05
 * ("prepared statement \"sN\" already exists").
 */
export function normalizeRuntimeDatabaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const usesSupabasePooler =
      parsed.port === "6543" ||
      parsed.hostname.includes(".pooler.supabase.com");

    if (!usesSupabasePooler) {
      return url;
    }

    parsed.searchParams.set("pgbouncer", "true");

    // Recommended for serverless: one pool connection per instance
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      parsed.searchParams.set("connection_limit", "1");
    }

    return parsed.toString();
  } catch {
    if (url.includes("pgbouncer=true")) {
      return url;
    }
    const looksPooled =
      url.includes(":6543") || url.includes("pooler.supabase.com");
    if (!looksPooled) {
      return url;
    }
    const separator = url.includes("?") ? "&" : "?";
    let next = `${url}${separator}pgbouncer=true`;
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      next += "&connection_limit=1";
    }
    return next;
  }
}

export function getRuntimeDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  return normalizeRuntimeDatabaseUrl(url);
}

export function isPreparedStatementPoolerError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  return (
    message.includes("42P05") ||
    message.includes("prepared statement") ||
    message.includes("already exists")
  );
}

export const PGBOUNCER_DATABASE_HINT =
  "Add ?pgbouncer=true to DATABASE_URL when using Supabase Transaction pooler (port 6543).";
