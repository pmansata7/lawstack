/**
 * Prisma schema requires DIRECT_URL. On Vercel Preview, DATABASE_URL is often set
 * but DIRECT_URL is not — this copies DATABASE_URL into DIRECT_URL so `prisma generate`
 * and schema validation succeed at install/build time.
 *
 * Production on Vercel should still set a real DIRECT_URL (direct Supabase host, port 5432)
 * for `prisma migrate deploy`; the pooler URL in DATABASE_URL is not ideal for migrations.
 */

export function ensurePrismaEnv() {
  const direct = process.env.DIRECT_URL?.trim();
  const database = process.env.DATABASE_URL?.trim();
  if (!direct && database) {
    process.env.DIRECT_URL = database;
  }
  if (!database && direct) {
    process.env.DATABASE_URL = direct;
  }
}

ensurePrismaEnv();
