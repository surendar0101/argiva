# 0015. Database migrations on deploy and real-browser tests

- Status: Accepted
- Date: 2026-11-26
- Deciders: Owner (+ agent)

## Context

The [25 November audit](../audit/2026-11-25-project-audit.md) found that deploys never created database tables, and that faults such as a server error on search passed every test because the tests ran only in a simulated browser. The agreed scope is in the [stabilisation design](../superpowers/specs/2026-11-26-stabilisation-design.md).

## Options considered

For database changes:

- A step in the deploy workflow, before the new version goes live. Little setup; the deploy account must be able to read the database connection secrets.
- A separate Cloud Run job. The deploy account never reads the secret, but needs a second image setup and more Google configuration.
- The app migrates itself at start-up. No setup, but several instances can collide and a failure takes the site down.

For catching browser faults:

- Playwright against a production build with throwaway databases. Slower than unit tests and needs a browser download.
- More simulated-browser tests. Fast, but cannot see server-rendering, styling-engine or native dialog behaviour.

## Decision

- Each deploy runs `db:migrate` and then `db:seed` before deploying. A failure stops the deploy.
- `db:migrate` is a small runner using Drizzle's migrator with `prepare: false`, so it works through Neon's pooled connection. It requires `DATABASE_URL` and has no fallback.
- `db:seed` holds reference data only (categories and draft policies) and only adds missing rows.
- The deploy account gets read access to the two database secrets. Dependencies are installed before it signs in to Google.
- Playwright and axe tests run against the production build, locally with `pnpm e2e` and in a separate CI job. Their databases are local, named `*_e2e`, and recreated each run; test products exist only there.
- Serious and critical accessibility findings fail the tests.

## Consequences

- A workflow in this repository can read the database connection strings. Branch protection and production approval matter more.
- Migrations must stay compatible with the previous app version, because rolling back the app does not roll back the database.
- If an administrator later deletes a seeded category or policy, the next deploy adds it back. Revisit this when administration exists (Phase 6).
- CI takes longer and downloads a browser.
