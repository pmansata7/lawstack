# Lawstack — one-time Prisma baseline (fix Vercel P3005)

## Why

Production Supabase was synced with `prisma db push`, so tables already exist but Prisma had **no** `prisma/migrations/` history. Vercel production runs `prisma migrate deploy` (`scripts/vercel-build.mjs`), which fails with:

**P3005** — The database schema is not empty. Read more about how to baseline an existing production database.

The repo now includes an initial **baseline** migration that describes the current schema. That migration must be **marked as already applied** on production once — it does **not** re-run the DDL on a DB that already matches the schema.

## What you do once (after the baseline PR merges)

From your machine, with **production** credentials:

1. In Supabase: **Project Settings → Database** — use the **direct** connection string (host `db.<project>.supabase.co`, port **5432**) for `DIRECT_URL`. Use the pooler or direct URL for `DATABASE_URL` as you already do in Vercel.

2. Run (replace placeholders with your URLs and the exact baseline folder name from `prisma/migrations/`):

```bash
cd lawstack   # your local clone

export DATABASE_URL='postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true'
export DIRECT_URL='postgresql://postgres.[ref]:[PASSWORD]@db.[ref].supabase.co:5432/postgres'

npx prisma migrate resolve --applied 20261012172737_baseline
```

3. Confirm Prisma sees the migration as applied:

```bash
npx prisma migrate status
```

4. Re-run or wait for the next **Vercel production** deploy on `main`. `prisma migrate deploy` should succeed; future schema changes ship via new migration folders as usual.

## What this does *not* do

- It does **not** change data or re-create tables if they already exist.
- It only inserts a row into Prisma’s `_prisma_migrations` table so deploy knows the baseline is done.

## If deploy still fails

- Ensure `DIRECT_URL` on Vercel points at the **direct** host (5432), not only the pooler.
- If production schema diverged from `schema.prisma`, fix drift before resolving or deploying — do not skip with resolve for migrations that were never actually applied.
