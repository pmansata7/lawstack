# Cursor Cloud Agent — Lawstack ship workflow

Cloud-only instructions (read with `.cursor/rules/*.mdc`). Uses **GITHUB_TOKEN** / `gh` in Actions; do not add or request new repository secrets for merge.

## When the user says ship, merge to main, or deploy

1. Create a feature branch from `main` (unless already on one).
2. Implement the change; run lint/tests when `package.json` defines them.
3. If `prisma/schema.prisma` or migrations change, follow `.cursor/rules/prisma.mdc` (generate, migrate, commit `prisma/migrations/`).
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

Merging to `main` triggers **Vercel production** (GitHub integration already configured). The Vercel build runs `prisma migrate deploy` before `next build` on production only. No separate Supabase migrate workflow — schema ships via Prisma migrations in the repo. No extra deploy step in the agent workflow.

## PR risk review

Every PR runs `.github/workflows/pr-risk-review.yml` (requires repo secret `CURSOR_API_KEY`). Wait for that workflow and other checks before expecting auto-merge to succeed.
