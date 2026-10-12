# Cursor Cloud Agent — Lawstack ship workflow

Cloud-only instructions (read with `.cursor/rules/*.mdc`). Uses **GITHUB_TOKEN** / `gh` in Actions; do not add or request new repository secrets for merge.

## When the user says ship, merge to main, or deploy

1. Create a feature branch from `main` (unless already on one).
2. Implement the change; run lint/tests when `package.json` defines them.
3. If `prisma/schema.prisma` or `prisma/migrations/` change, follow `.cursor/rules/prisma.mdc` (generate, migrate, commit). If the task adds **Supabase SQL** under `supabase/migrations/`, commit those files in the PR — they apply on `main` via GitHub Actions, not Vercel.
4. Commit, push, and open a **pull request** targeting `main`.
5. **Must** add the HTML comment `<!-- auto-ship -->` (exact string) to the PR description when opening or updating the PR (top or bottom). When using auto-ship, create the PR **ready for review** (`draft: false` / not a draft). Draft PRs skip auto-ship because Actions cannot mark bot-opened drafts ready. The **Auto-ship marker and merge** workflow adds label **`auto-merge`** and squash-merges when checks pass. You may still run `gh pr edit <number> --add-label auto-merge` (or **`ship`**) as a backup; the marker is primary.
6. Optionally enable GitHub auto-merge on the PR when the repo allows it:
   `gh pr merge <number> --auto --squash`
   The **Auto-merge labeled PR** workflow will still squash-merge when checks pass and no review blocks merge.

## Do not merge / do not add `auto-merge` when

- Required PR checks are failing or still pending (workflow waits with `scripts/wait-for-external-pr-checks.sh`).
- The PR risk review bot (or any reviewer) left **CHANGES_REQUESTED**.
- The change is high-risk and the user did not explicitly ask to ship.

## Trivial doc-only changes

If the user explicitly authorizes it and branch protection allows, you may push directly to `main` without a PR. Otherwise use the PR + `<!-- auto-ship -->` marker flow above.

## Production deploy

Merging to `main` triggers **Vercel production** (GitHub integration already configured). The Vercel build runs **`prisma migrate deploy`** before `next build` on production only (applies `prisma/migrations/`). Vercel does **not** run `supabase/migrations/`.

**One-time (existing prod DB):** After the initial `prisma/migrations/*_baseline` lands, run locally once: `DATABASE_URL=... DIRECT_URL=... npx prisma migrate resolve --applied <baseline_folder_name>` against production Supabase **direct** URL so P3005 does not block deploy. See `.cursor/rules/prisma.mdc`.

## Supabase migrations (GitHub Actions)

After merge to `main`, new or changed files under **`supabase/migrations/`** are applied by **`.github/workflows/supabase-migrate.yml`** (push when migrations or that workflow change, or manual **workflow_dispatch**). Commit migration SQL in the PR; do not apply production schema only via the Supabase SQL Editor unless the user explicitly asks.

One-time repo secrets (GitHub → Settings → Secrets and variables → Actions): **`SUPABASE_ACCESS_TOKEN`**, **`SUPABASE_PROJECT_REF`**, **`SUPABASE_DB_PASSWORD`**. See `docs/SHIP-SETUP.md`.

**`SUPABASE_PROJECT_REF` must be the 20-character Reference ID** from Dashboard → Project Settings → General (lowercase letters only). It is the `<ref>` in `https://<ref>.supabase.co` — **not** the project display name.

## PR risk review

Every PR runs `.github/workflows/pr-risk-review.yml` (requires repo secret `CURSOR_API_KEY`). Wait for that workflow and other checks before expecting auto-merge to succeed.
