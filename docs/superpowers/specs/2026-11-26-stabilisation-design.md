# Storefront stabilisation design

Status: **approved by the owner** (26 November 2026).

This replaces the [24 November follow-up design](2026-11-24-phase-4-review-followup-design.md) and its four unstarted plans. Their fixes are carried over here, with the changes noted below.

## Intent

Make what already exists work, show nothing made up, and deploy safely, before adding features. The work comes from the [25 November audit](../../audit/2026-11-25-project-audit.md) and a re-check of the source on 26 November.

## Goals

1. No broken links or images on the storefront.
2. No invented products, prices or rates, and no internal `TODO(owner)` text visible to customers.
3. Rate-priced products, the cart and the cart drawer behave correctly.
4. Every environment (local, CI, staging, production) gets its database tables automatically or by one documented command.
5. Real-browser tests catch faults that the simulated-browser tests miss.

## Non-goals

- Data model additions, pricing formula, missing filters, missing homepage sections.
- Checkout, payments, accounts or admin.
- Visual redesign or polish.
- Product photography or real product data.
- Removing `config.env` from the public repository (an audit risk, handled separately).

## Constraints

- Copy and policies come from [brand content](../../brand-content.md) and recorded owner decisions. Nothing is invented.
- Money stays in integer paise; styling uses `--argiva-*` tokens only.
- Settings come from typed configuration. No secrets in the repository.
- No `git commit` or `git push` by the agent. No changes to staging or production databases by the agent.
- Work is test-first.

## Approaches

| Approach | Trade-off |
| --- | --- |
| **A. Stabilise first (chosen by the owner)** | Site and deploy path become trustworthy quickly. Some seed and catalog code may change again with the data model |
| B. Data model first | Less rework, but the site stays broken longer and the pricing formula is undecided |
| C. One combined plan | Fewer hand-offs, but too large to review and verify well |

For database changes on deploy:

| Approach | Trade-off |
| --- | --- |
| **Step in the deploy workflow, before the new version goes live (chosen)** | Little setup. The deploy account must be allowed to read the database connection secret |
| Separate Cloud Run job | Deploy account never reads the secret, but needs a second image setup and more Google configuration |
| App migrates itself at start-up | No setup, but several instances can collide and a failure takes the site down |

## Design

### 1. Honest storefront

| Item | Behaviour |
| --- | --- |
| Homepage hero | The image becomes optional. Without one, a decorative placeholder drawn with design tokens, hidden from screen readers. No third-party imagery |
| Checkout button | Removed. The cart shows "Online checkout is not available yet." No `/checkout` route |
| Shipping note | Cart and drawer use the brand wording: "Applicable shipping charges will be communicated or displayed before the order is confirmed." |
| Missing business facts | Footer, contact page and policy pages show "Details coming soon." in place of any `TODO(owner)` text. The open items stay listed for the owner in the runbook and code comments |
| Seed data | Only the approved categories and draft policies. The invented owner account, products, variants and silver rate are removed |
| Legal facts | Cancellation and refund terms recorded in Phase 0 stay, as a draft. "Sole proprietorship", the grievance officer statement and the jurisdiction become "Details coming soon." until the business is registered and the owner confirms them |
| Return and cancellation drafts | Returns text stays as written in brand content, under the draft banner |

The "Legal facts" row differs from the 24 November design, which also replaced the cancellation terms. The owner decided those terms in Phase 0. The proprietorship was recorded as planned, not yet registered.

### 2. Prices and cart

- A rate-priced product with no approved rate appears in collections and search with "Price unavailable". A product with any priced variant shows its lowest known price.
- A price filter never matches an unknown price, and is hidden when no price is known.
- A saved cart entry is accepted only if its price is a non-negative whole number within the safe range. Others are ignored with the existing warning.
- The cart drawer becomes a native modal dialog: named, focus starts on the close button, focus stays inside, Escape and backdrop close it, and focus returns to the control that opened it.

### 3. Database changes and deploy

- `@argiva/db` gets a small migration runner that works with Neon's pooled connection, replacing the current command's silent fallback to a database that does not exist. It stops with an error if `DATABASE_URL` is unset.
- The deploy workflow runs, in order: migrate, load reference data (categories and draft policies), deploy, smoke test. A failed step stops the deploy. Production still waits for the owner's approval before any step runs.
- Loading reference data only adds missing rows. It never changes or deletes existing ones.
- **Owner setup, once:** allow the deploy account to read the two database secrets. The commands go in [setup](../../setup.md). The secret is read during the run and masked in logs.
- Migrations must keep the previous app version working (add first, remove in a later release), because rolling back the app does not roll back the database. The runbook says so.
- CI's container check applies migrations and reference data before its smoke test. Today it applies neither, so it is expected to fail on this branch.
- The smoke test also checks the collections page, one policy page and a search.

### 4. Browser tests

- Playwright, with automated accessibility checks, run against a production build and a throwaway Postgres database. Run locally with one command and in CI.
- Test products exist only in test fixtures. The loader refuses any database that is not local and named for testing.
- Coverage at phone and desktop widths:
  - every public page loads with no console errors, failed requests or `TODO(owner)` text;
  - internal links do not lead to a 404;
  - collection filters, search, unavailable prices;
  - add to cart, drawer by keyboard, cart page, reload keeps the cart;
  - the empty shop (reference data only) renders sensibly.
- Serious and critical accessibility findings fail the tests. Small fixes are made; any that need a design change are reported to the owner first.

### 5. Documentation

README, setup, runbook, the web, database and UI package READMEs, an ADR for migrations and browser testing, the docs index and the decisions log. All relative links must resolve.

## Effects to expect

- The shop has no products until real ones are entered. Collections show their empty message.
- An already-seeded local database keeps the old invented rows. The runbook gives the reset command; the agent will not run it on the owner's database.
- **Do not merge to `main` until this work is finished and the owner setup above is done.**

## Done when

- Tests, typecheck, lint, build and the new browser tests pass locally, with fresh output.
- A local run from an empty database, using only documented commands, serves every page.
- CI passes on a pull request (the owner opens it).
- Staging deploys from `main` and passes the smoke test (the owner merges). Phase 4 stays "in progress" until the functionality work after this is also complete.

## Left to the builder

File layout of the browser tests, placeholder styling within existing tokens, how the CI container job runs the migration, and the order of tasks in the plan.
