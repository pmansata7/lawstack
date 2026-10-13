# Lawstack — full setup walkthrough (do in order)

Use this once to get **review + auto-ship + Vercel production + Prisma** working.

---

## Already done (verify only)

| Item | Status |
|------|--------|
| Ship workflows on `main` (#37) | Merged |
| `CURSOR_API_KEY` secret | Present |
| `auto-merge` label | Present |
| Actions workflow permissions **Read and write** | Set via API |
| **Allow auto-merge** on repo | Enabled |
| Baseline migration PR | [#38](https://github.com/pmansata7/lawstack/pull/38) | Merged

---

## Step 1 — Let baseline land on `main`

1. Open [#38](https://github.com/pmansata7/lawstack/pull/38).
2. Wait for **PR risk review** + **Auto-ship** to finish (or merge manually if stuck).
3. On `main`, confirm folder exists: `prisma/migrations/20261012172737_baseline/`.

---

## Step 2 — One-time Prisma baseline on production (fixes P3005)

Your Supabase DB already has tables; Prisma needs to **record** the baseline without re-running DDL.

1. Clone/pull `lawstack` on your Mac.
2. Supabase → **Project Settings → Database**:
   - **Database password** (or reset if lost).
   - **Connection string** → **URI**:
     - **Pooler** (port 6543, `?pgbouncer=true`) → `DATABASE_URL`
     - **Direct** (host `db.<ref>.supabase.co`, port **5432**) → `DIRECT_URL`
3. In terminal:

```bash
cd lawstack
export DATABASE_URL='postgresql://...pooler...'
export DIRECT_URL='postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres'

npx prisma migrate resolve --applied 20261012172737_baseline
npx prisma migrate status   # should show baseline applied
```

4. Do this **after** #38 is on `main` and **before** you expect the next Vercel prod build to succeed.

See [PRISMA-BASELINE-ONCE.md](./PRISMA-BASELINE-ONCE.md)

---

## Step 3 — Vercel (production deploy)

1. [vercel.com](https://vercel.com) → log in as **pmansata7** (or team that owns the project).
2. **Account → Authentication → GitHub** → access to **`lawstack`**.
3. Open the **lawstack** project → **Settings → Git**:
   - Connected repo: `pmansata7/lawstack`
   - **Production Branch:** `main`
4. **Settings → Environment Variables** — add for **Production** and **Preview**:

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | Supabase pooler URI |
| `DIRECT_URL` | Supabase **direct** URI (5432) — required for migrate + Preview |
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase API settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only |
| (others) | Any keys your app uses (OpenAI, etc.) — match local `.env` |

5. **Deployments** → **Redeploy** latest **Production** (or push empty commit to `main`).
6. Build should run `prisma migrate deploy` then Next build — **Ready** without P3005.

---

## Step 4 — Cursor GitHub (PR review bot)

1. [cursor.com/dashboard](https://cursor.com/dashboard) → **Integrations → GitHub**
2. Ensure **`pmansata7/lawstack`** is allowed.

---

## Step 5 — Smoke test

1. Create branch, tiny change (e.g. comment in README).
2. Open PR to `main` with body containing: `<!-- auto-ship -->`
3. Confirm:
   - Action **PR risk review** → success, bot comment on PR
   - **Auto-ship marker and merge** → squash-merge when checks pass
4. Vercel → new **Production** deployment → **Ready**

---

## Step 6 — GitHub secrets (database deploy workflow)

One-time: **Settings → Secrets and variables → Actions** → add:

| Secret | Required | Where to get it |
|--------|----------|-----------------|
| `SUPABASE_ACCESS_TOKEN` | Yes | [Account tokens](https://supabase.com/dashboard/account/tokens) |
| `SUPABASE_PROJECT_REF` | Yes | **Reference ID** (20 lowercase letters; `<ref>` in `https://<ref>.supabase.co`) |
| `SUPABASE_DB_PASSWORD` | Yes | **Database** password |
| `DIRECT_URL` | No | Direct Postgres URI (5432); if omitted, CI builds `db.<ref>.supabase.co` from ref + password |
| `DATABASE_URL` | No | Pooler URI for runtime; CI uses `DIRECT_URL` for migrate + RLS when unset |

The workflow [`.github/workflows/supabase-migrate.yml`](../.github/workflows/supabase-migrate.yml) (**Database deploy**) on every qualifying push to `main` (or manual run):

1. `supabase db push` — `supabase/migrations/*.sql`
2. `prisma migrate deploy` — `prisma/migrations/*` (same P3005 baseline auto-resolve as Vercel)
3. `npm run db:rls` — `supabase/rls-policies.sql`

You do **not** need to run `db:rls` or `prisma migrate deploy` manually on production after this is configured.

---

## Step 7 — Day-to-day shipping

- Cloud Agent on `pmansata7/lawstack`; read `.cursor/CLOUD.md`.
- **Prisma schema:** `npx prisma migrate dev` locally → commit `prisma/migrations/*` → applied on **`main`** by **Database deploy** (and again on Vercel production build if you deploy there).
- **Supabase SQL + RLS:** commit under `supabase/migrations/` or edit `supabase/rls-policies.sql` → applied on **`main`** by **Database deploy**.
- PR body: `<!-- auto-ship -->` when you want merge without clicking.

---

## If something fails

| Symptom | Fix |
|---------|-----|
| P3005 on Vercel | Complete Step 2 (`migrate resolve`) after baseline on `main` |
| P1012 / missing env on Preview | Add `DIRECT_URL` (and `DATABASE_URL`) on **Preview** in Vercel |
| Auto-merge stuck | Actions **Read and write**; PR has `<!-- auto-ship -->` |
| Review workflow fails | Check `CURSOR_API_KEY`; Cursor integration includes repo |
| Supabase migrate fails on `main` | Fix the three Actions secrets; `SUPABASE_PROJECT_REF` must be 20 lowercase letters |
| SQL / RLS not on prod after merge | Run **Database deploy** workflow manually; confirm the three Supabase secrets |
