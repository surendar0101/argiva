# Phase 2: Foundations, work log

Plan: [docs/plans/2026-10-31-phase-2-foundations.md](../docs/plans/2026-10-31-phase-2-foundations.md). Execution: one subagent per task. I check each task myself. No commits, no worktree.

## Decisions taken while planning (2026-10-31)

- **TypeScript 6.0.x instead of 7.0.** TypeScript 7 ships only the `tsc` binary, with no JavaScript API. Next.js type-checks through that API, and typescript-eslint requires TypeScript below 6.1. Revisit when both support 7.
- **ESLint 9, not 10.** `eslint-plugin-react`, which `eslint-config-next` pulls in, supports up to ESLint 9.
- **No Prettier for now.** The roadmap asks only for linting, and a formatter would rewrite Phase 1 files. It can be added later as its own change.
- **Health is split in two.**
  - `/api/health` (liveness) never touches the database, so Cloud Run start-up doesn't wait for Neon to wake.
  - `/api/ready` checks the database.
- **One image for every environment.**
  - Config is read at run time: the root layout calls `connection()`.
  - Production promotes the image that staging built, using the same SHA.
- **Workflows stay off until set up.** The deploy workflows skip until the owner sets the GitHub variable `GCP_PROJECT_ID`.
- **No changes to `@argiva/ui`.** It has no `'use client'` directives. `apps/web` re-exports `ThemeProvider` from a client file. Phase 4 decides how the storefront composes the other components.
- **Playwright end-to-end tests move to Phase 4,** when real pages exist. Phase 2 uses an HTTP smoke script (`scripts/smoke.mjs`) locally, in CI and after each deploy.

## Tasks

- Task 1: complete.
  - TypeScript 6.0.3 is now used everywhere: the root, `packages/ui` and `apps/ui-preview`. No tsconfig changes were needed.
  - Turbo 2.11.10 and `turbo.json` are added, with the root scripts `build`, `test`, `typecheck` and `dev`.
  - Verified: build, typecheck and test exit 0; the 43 ui tests and 4 script tests pass; the second build was a full cache hit (`FULL TURBO`).
  - `docs/decisions.md` has a new "Tooling notes" section.
- Task 2: complete.
  - Installed ESLint 9.39.5, typescript-eslint 8.72.1, eslint-config-next 16.4.3, jsx-a11y 6.10.2 and react-hooks 7.1.1.
  - Created `eslint.config.mjs`. Type-aware linting is on. A rule blocks `process.env` outside `@argiva/config` (ADR 0012).
  - Created `scripts/check-hardcoded.mjs`, with 6 tests that pass. `lint:no-hex` now covers `apps/web/src`.
  - One override: `jsx-a11y/anchor-has-content` is off for `packages/ui/src/components/Button/Button.tsx`. ButtonLink passes its children through `{...rest}`, which the rule cannot see. The code is unchanged.
  - The Next lint preset loads only once `apps/web` exists (Task 4). It needs `next` installed.
  - `pnpm-workspace.yaml` now has `allowBuilds: unrs-resolver: false`, because its install script isn't needed.
  - Verified: `pnpm lint` exits 0; all 10 script tests pass; the 43 ui tests pass.
- Task 3: complete.
  - Added `@argiva/config`: it uses Zod 4.6.7, and `loadConfig()`, `getConfig()` and `ConfigError` all work. All 9 tests pass, and none of them puts a secret in its error message.
  - Added `.env.example`, which holds safe local values only. `.data/` is now in `.gitignore`.
  - The code matches the plan exactly. Repo-wide lint, typecheck and test all exit 0.
- Task 4: complete.
  - Created `apps/web`: Next 16.4.3, React 19.3.1, postgres 4.0.0. It builds a standalone server.
  - Server sets `<html data-theme>`: shows `quiet-luxury`, or `warm-craft` when `DEFAULT_THEME_ID` is set to it.
  - Pages outside production get `noindex, nofollow`. All 6 security headers are sent; `X-Powered-By` is not.
  - Fail-fast checked: with `APP_ENV=bogus` the app prints `Invalid configuration: APP_ENV ...` and exits with code 1.
  - Deviations:
    - `next.config.ts` has `headers: () => Promise.resolve([...])`, to satisfy the lint rule `require-await`.
    - `next dev` generates `apps/web/AGENTS.md`, a pointer to the bundled Next docs. I kept it.
    - `next-env.d.ts` is now in `.gitignore`, as `create-next-app` does.
    - The build warns about Edge Runtime for `process.exit` in `instrumentation.ts`. It's harmless, because the code returns early when not on Node.
  - Verified: build, lint, typecheck and test all exit 0. Tests pass: web 2, ui 43, config 9, scripts 10.
- Task 5: complete.
  - `/api/health` returns 200 `{"status":"ok","version":"dev"}`.
  - With no database, `/api/ready` returns 503 `{"status":"unavailable","db":"down"}`. Both send `no-store`, and the log line names only the error type.
  - All 6 web tests pass.
  - One test changed to `Promise.reject(...)` to satisfy the lint rule `require-await`.
  - No changes were needed for postgres 4.0.0.
  - Verified: build, lint, typecheck and test all exit 0.
- Task 6: complete, with one defect found (waiting on the owner; details below).
  - Created `scripts/smoke.mjs`, `Dockerfile`, `.dockerignore` and `docker-compose.yml`, exactly as in the plan.
  - Registry: the build reached `registry.npmjs.org` through Docker Desktop's proxy, so no mirror was needed. The host mirror needs client certificates, which never go into the image. The lockfile pins no registry URLs.
  - Image `argiva-web` is 289 MB; the app inside it is 40 MB. The first build took about 6.5 min, nearly all of it pulling base images; the build steps took about 15 s.
  - Smoke test: 3 of 3 checks pass.
  - Fail-fast: with `APP_ENV=bogus` the container exits 1.
  - The app runs as a non-root user (uid 100).
  - Stopping the database makes `/api/ready` return 503; starting it again returns 200.
  - **Defect: no web fonts ship.** The built CSS has no `@font-face` rules and there's no `.next/static/media` folder. This also happens on the host build. Cause: `packages/ui/package.json` sets `sideEffects: ["**/*.css"]`, so the bundler drops the CSS-only import of `@argiva/ui/fonts`. The fix touches Phase 1 code, so I've asked the owner.
  - Left on the machine: a `hello-world` Docker image from a pull test. The stack is stopped and its volumes are kept.
- Font defect fixed (2026-10-31, owner chose option a).
  - `packages/ui/package.json`: `sideEffects` now also lists `./src/styles/fonts.ts`. The build now ships 63 font files and the CSS has `@font-face` rules again.
  - `scripts/smoke.mjs` has a 4th check: the page's stylesheets must contain `@font-face`. This stops the bug from coming back.
  - Verified: the container smoke test passes 4 of 4, lint exits 0, and all 43 ui tests pass.
- Tasks 7 and 8: complete.
  - Added four workflows: `ci.yml` (two jobs, verify and container), `deploy.yml` (reusable), `deploy-staging.yml` (runs after CI passes on main) and `deploy-production.yml` (runs on a `v*.*.*` tag).
  - actionlint reports no findings.
  - Ran CI locally with the cache bypassed: install, build, lint, typecheck and test all exit 0. The container job passes the smoke test 4 of 4.
  - I added one thing to the plan: `deploy.yml` now pins Node 22 for its smoke step.
  - Notes:
    - `workflow_run` triggers only work once the workflow is on `main`.
    - Both deploy jobs show as skipped until `GCP_PROJECT_ID` is set.
    - Don't add `version:` to `pnpm/action-setup`; it reads `packageManager`.
- Task 9: complete.
  - Wrote `docs/runbook.md` (9 sections) and added "Develop locally" to the README.
  - The WIF, cleanup-policy, budget, rollback and GitHub-environment steps were checked against the official docs.
  - Every variable name matches `.env.example`, the schema and the workflows.
  - Fixed the `.env.example` header: copy it to `apps/web/.env.local`.
  - Secret Manager secrets are stored only in asia-south1.
  - For the owner: on a private repo, GitHub Free doesn't offer environments, required reviewers or branch protection.
  - Carried forward:
    - Phase 3: set `prepare:false` for Neon pooled connections.
    - Phase 8: move the auth and setup-gcloud actions to v3, pin actions by SHA, and narrow the WIF condition.
- Fix: the build printed "Ecmascript file had an error" because `process.exit` appeared in `instrumentation.ts`, which is also compiled for the edge runtime.
  - Moved the config check into `src/instrumentation-node.ts`, which is only imported in the Node runtime (the pattern the Next.js docs recommend).
  - The build is now clean. Invalid config still exits with code 1 and prints the list of problems (checked).
- Task 10: complete.
  - Fresh copy (no node_modules or git): install, build, lint, typecheck and test all exit 0. Tests: config 9, web 6, ui 43, scripts 10.
  - `docker compose` rebuilt and the smoke test passed 4/4.
  - Browser check:
    - axe: 0 violations (24 passes).
    - `data-theme` is quiet-luxury.
    - Marcellus and Hanken Grotesk fonts loaded.
    - Screenshot saved as `sdd/design/phase-2/home-holding.png`.

## Phase 2 summary
- **Built:**
  - typed config (`@argiva/config`);
  - Next.js 16 web app with a holding page, security headers, `/api/health` and `/api/ready`, and fail-fast on bad config;
  - Postgres client;
  - Docker image (289 MB, non-root) and a compose stack;
  - smoke test;
  - CI (verify plus container);
  - staging and production deploy workflows (WIF, promoting the same image);
  - runbook.
- **Also fixed:** Phase 1 font loading (`sideEffects`), with owner consent.
- **Status:** awaiting the owner actions listed in `state.awaitingOwner`. Phase 2 is done when CI is green on GitHub and staging deploys from main.
- README rewritten at owner request: what the project is, repo layout, prerequisites, start-up steps (Docker and dev server), design preview, everyday commands, deploying summary.

## Documentation request (owner, 2026-10-31)

- **Owner decision:** stay on GitHub Free. Still open: public or private repository (see `docs/setup.md` §2.2). Private needs workflow changes first.
- **Created `docs/setup.md`,** the owner's one-time setup guide:
  - tools;
  - GitHub account and plan comparison;
  - Google account and billing;
  - Neon account;
  - first push;
  - Google Cloud, Neon and GitHub settings, moved word-for-word from runbook §3–5 with the same numbering;
  - first deploy check.
  - Runbook §3–5 are now short pointers to it, and the other runbook cross-references link to it.
- **Documentation rule added** to the scaffold prompt (Process, plus a line in Delivery phases), `AGENTS.md`, the `state.json` rules and the roadmap. Every phase ends with a docs task covering: README, setup, runbook, package READMEs, ADRs and the docs index.
- **Task 11 (docs backfill): complete.**
  - Created `docs/README.md` (the docs index).
  - Created READMEs for `apps/web`, `apps/ui-preview`, `packages/ui` and `packages/config` (written by a subagent from the code).
  - The README links the setup guide.
  - Link check: 0 broken links, anchors included. Lint exits 0.
- **Findings from the docs review,** not fixed because they're product code (recorded in `phase2.notes`):
  - the `start` script uses `next start`, which conflicts with the standalone build;
  - `lint:hardcoded` skips `ui-preview`;
  - `ui-preview` hard-codes its fallback theme;
  - `apps/web` has no lint script of its own;
  - the `Price` test has no axe check.
