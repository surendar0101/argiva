# Project audit, 25 November 2026

A check of everything built in Phases 1 to 4, including the uncommitted work. No product code was changed.

> **Update, same day:** fault 1 (styling) is fixed and a `lint:css-vars` check now guards it. See the [new screenshots](../../sdd/audit-2026-11-25/after-css-fix/). Everything else below still applies.
>
> **Update, 26 November:** fault 2 (search crash) is fixed, and lint now skips the skill folders.

## Verdict

The foundations are usable. The storefront is broken in ways the tests cannot see, and the database model covers only part of the requirements. Phases 3 and 4 should not be treated as finished.

## How it was checked

| Check | Result |
| --- | --- |
| Tests, uncached | Pass: web 90, UI 44, database 12, domain 27, config 11. The 11 script tests also pass |
| Typecheck and production build | Pass |
| Lint | Fails with 84 errors, all in the new `.claude/` and `.agents/` skill folders. Project code passes |
| Running app | Fresh build on port 3100 with a throwaway database, migrated and seeded, screenshots at 390 px and 1440 px |
| Not checked | Accessibility scan, Lighthouse, cart interaction in the browser, the live staging site |

Screenshots are in [sdd/audit-2026-11-25/](../../sdd/audit-2026-11-25/).

## Broken now

1. **Large parts of the site have no styling.** 172 of 688 CSS variable references point to names that do not exist (for example `--argiva-spacing-4`; the real name is `--argiva-space-4`). All references are missing in the footer and the homepage collection, heritage and promise sections, and 64 of 68 in the cart drawer. This causes much of the poor look.
2. **Search crashes** (server error 500) when it has results. The theme provider was marked browser-only, but the purity badge calls it while the search page renders on the server. Tests run in a simulated browser, so they pass.
3. **The homepage hero image is missing** (404). `apps/web/public` has no files.
4. **"Continue to Checkout" leads to a 404.** Checkout is Phase 5.
5. **Customers see `TODO(owner)` text** in the footer on every page, and on the contact and policy pages.
6. **Port 3000 serves two different apps.** A three-week-old Docker container (`argiva-web-1`, no collections page) listens on `127.0.0.1:3000`. A `next dev` server started on 23 November listens on the same port and did not respond. The audit rebuilt the app while that server was running, which may have caused the stall. Restart it before judging anything in the browser.

## Missing from Phases 3 and 4

Compared with [the build prompt](../../.github/prompts/scaffold-argiva.prompt.md) and [brand content](../brand-content.md):

| Area | Gap |
| --- | --- |
| Product data | No product images table, shipping weight, occasion or style |
| Admin groundwork | No tables for offers, damage claims, re-polishing requests or a permission matrix |
| Pricing | Rate price is only weight × rate × purity + making charge. Wastage, margin, tax, other metals and finishing are absent |
| Pricing facts | The formula is still an open question, yet the code fixes one, including an unexplained 50% factor for "other" purity. The seed adds a made-up approved silver rate |
| Seed data | Five invented products, some marked verified purity. The cancellation draft goes beyond brand content (it does record your earlier decision, which brand content never absorbed) |
| Stock | Reservation logic is in memory only; nothing reserves stock in the database |
| Homepage | Three brand sections and the "Discover Our Story" button are missing |
| Filters | 3 of the 7 required: price, composition, finish |
| Photography | Product pages and cards show only "Photograph coming soon" |
| Quality gates | No browser end-to-end tests; no check for undefined CSS variables |
| Deployment | The deploy workflow never runs database migrations, so a deploy of this code would meet a database without its tables |

## Repository risks

- **All Phase 3 and 4 work exists only on this computer.** None of it is committed.
- **The GitHub repository is public**, and `config.env` is committed with the Google Cloud project ID, billing account ID and service account names. These are not passwords, but they should not be public.
- `neon.env` (database and storage keys) is ignored by git and is on no GitHub branch. Local editor checkpoint references do contain it, so never run `git push --mirror`.
- Skills are installed in three places: `.github/skills`, `.claude/skills` and `.agents/skills`.

## What is worth keeping

Monorepo setup, CI and deploy workflows, typed configuration, design token package, health checks and security headers, ADRs and runbook, and the composition labelling rules with their tests. The collections, product and Our Story pages, which use the correct style names, give a fair view of the current design direction.

## Ways forward

| Option | What happens | Trade-off |
| --- | --- | --- |
| A. Repair | Fix the faults above in the current pages | Fastest. Keeps a layout and user experience you dislike |
| **B. Keep foundations, redo the product (recommended)** | Redesign the storefront from approved mockups, correct the data model while no real data exists, then rebuild page by page with browser checks | More work than A. Fixes both causes without redoing working setup |
| C. Start over | New repository from Phase 0 | Discards working tooling and deployment for little gain |

Under option B the order would be: save a checkpoint commit, fix the style names so you can see the intended design, agree the new design, correct the data model, rebuild the storefront, then continue to Phase 5. The four [follow-up plans](../superpowers/plans/) from 24 November stay paused; their seed, price and cart items carry into the new plan.
