# Storefront Stabilisation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing storefront work, show nothing made up, deploy with its database tables, and be checked in a real browser.

**Architecture:** Fix behaviour inside the current Next.js app and shared packages. Add a migration runner to `@argiva/db`, run it and an insert-only reference-data seed before each deploy, and add Playwright tests against a production build with throwaway databases.

**Tech Stack:** Next.js 16.4.3, React 19, Drizzle ORM 0.45.4, postgres.js, Vitest 5, Playwright with `@axe-core/playwright`, GitHub Actions.

**Spec:** [2026-11-26-stabilisation-design.md](../specs/2026-11-26-stabilisation-design.md). It supersedes the four plans dated 2026-11-24; do not run those.

## Global Constraints

- **Never `git commit` or `git push`.** Each task ends with a checkpoint: `git diff --check`, then update `sdd/state.json` (validate it as JSON) and append to `sdd/phase-4-storefront.md`.
- Never run migrations or the seed against staging, production or the owner's local database. Use a throwaway Postgres container on another port, and remove only what you started.
- pnpm is not on PATH. Every `pnpm X` below means `npx --loglevel=error pnpm@12.16.1 X`.
- Copy comes from `docs/brand-content.md` or this plan. New copy, exactly: `Details coming soon.`, `Price unavailable`, `Online checkout is not available yet.`
- Brand copy, exactly: `Applicable shipping charges will be communicated or displayed before the order is confirmed.`
- Money is integer paise. Styling uses `--argiva-*` tokens only, no hex literals.
- Source files read settings through `@argiva/config`. Package runners and test tooling outside `src/` may read `process.env`.
- Out of scope: data model changes, pricing formula, new filters, new homepage sections, checkout, admin, visual redesign.
- Test-first: see each new test fail for the stated reason before implementing.

## Review Focus

1. A fixed-price variant with no or zero price: shows `Price unavailable`, the page does not crash (Task 3).
2. Pressing Escape in the cart drawer, then reopening it: it reopens, and focus returns to the control that opened it (Tasks 4 and 6).
3. A saved cart whose price × quantity exceeds the safe integer range: the entry is ignored (Task 4).
4. Running migrations and the seed a second time: both succeed and change nothing (Task 6).
5. A search containing `%`, `_` or `<script>`: the page returns 200 and shows no match (Task 6).

---

### Task 1: Honest seed data and business facts

**Files:**
- Modify: `packages/db/src/seed.ts`, `packages/db/src/seed.test.ts`
- Create: `apps/web/src/lib/placeholders.ts`
- Modify: `apps/web/src/components/layout/site-footer.tsx` and its test, `apps/web/src/app/contact/page.tsx`
- Test: `apps/web/src/app/policies/policies.test.tsx`

**Interfaces:**
- Produces: `initialSeedData: { categories: NewCategory[]; policies: NewPolicy[] }`; `seedDatabase(db)` unchanged in signature; `DETAILS_COMING_SOON = 'Details coming soon.'`.

- [ ] **Step 1: Write failing seed tests.** Replace the anklet-pair and pricing tests with:

```ts
it('seeds only reference data', () => {
  expect(Object.keys(initialSeedData).sort()).toEqual(['categories', 'policies']);
});

it('contains no internal notes or unconfirmed seller claims', () => {
  const text = JSON.stringify(initialSeedData.policies);
  expect(text).not.toContain('TODO(owner)');
  expect(text).not.toMatch(/sole proprietorship|is the grievance officer|Bengaluru/i);
});

it('keeps the cancellation terms decided in Phase 0', () => {
  const text = JSON.stringify(initialSeedData.policies.find((p) => p.slug === 'cancellation'));
  expect(text).toContain('Orders may be cancelled without charge before dispatch.');
  expect(text).toContain('5–7 business days');
});
```

- [ ] **Step 2: Write failing web tests.** In the footer test, replace the final `TODO(owner)` assertion with `expect(document.body).toHaveTextContent('WhatsApp: Details coming soon.')` and `expect(document.body.textContent).not.toContain('TODO(owner)')`. In `policies.test.tsx`, render the contact page and assert no `TODO(owner)`, no `Sole proprietorship`, no `Bengaluru`, and five or more `Details coming soon.` entries. Update any existing assertion there that expects the old text.
- [ ] **Step 3: Run** `pnpm --filter @argiva/db test` and `pnpm --filter @argiva/web test`. Expected: the new tests fail on the extra keys and old text.
- [ ] **Step 4: Edit the seed.** Remove `OWNER_USER_ID`, users, products, variants, silver rate and their inserts. Keep categories, and the shipping, returns, cancellation and care text. Terms, privacy and cookies contain one paragraph: `Details coming soon.` Shipping's final paragraph becomes `Details coming soon.` Seller disclosures become one paragraph per label (`Seller entity`, `Legal name`, `Business address`, `Grievance officer`, `Email`, `Phone`, `Jurisdiction`), each `<label>: Details coming soon.` Record the missing facts in a `// TODO(owner):` comment above that record.
- [ ] **Step 5: Edit footer and contact page** to use `DETAILS_COMING_SOON` for every missing fact (contact: phone, email, WhatsApp, seller entity, legal name, address, grievance officer, jurisdiction). Keep a `TODO(owner)` code comment naming each.
- [ ] **Step 6: Run** both test commands again. Expected: PASS.
- [ ] **Step 7: Checkpoint.**

### Task 2: Homepage placeholder and checkout boundary

**Files:**
- Modify: `packages/ui/src/components/Hero/Hero.tsx`, `Hero.module.css`, `Hero.test.tsx`
- Modify: `apps/web/src/app/page.tsx`, `page.test.tsx`
- Modify: `apps/web/src/app/cart/page.tsx`, `page.module.css`, `page.test.tsx`
- Modify: `apps/web/src/components/cart/cart-drawer.tsx`, `cart-drawer.test.tsx`

**Interfaces:**
- Produces: `Hero` prop `image?: ImageData`.

- [ ] **Step 1: Write failing tests.**

```tsx
// Hero.test.tsx
test('without a photograph it shows a decorative frame and no image', async () => {
  const { image: _unused, ...withoutImage } = props;
  const { container } = render(<Hero {...withoutImage} />);
  expect(screen.queryByRole('img')).toBeNull();
  expect(container.querySelector('[data-media] [aria-hidden="true"]')).not.toBeNull();
  await expectNoAxeViolations(container);
});
// page.test.tsx (home)
expect(container.querySelector('img')).toBeNull();
// cart/page.test.tsx, with one item
expect(document.querySelector('a[href="/checkout"]')).toBeNull();
expect(screen.getByText('Online checkout is not available yet.')).toBeInTheDocument();
// cart-drawer.test.tsx, drawer open
expect(screen.getByText('Applicable shipping charges will be communicated or displayed before the order is confirmed.')).toBeInTheDocument();
```

- [ ] **Step 2: Run** `pnpm --filter @argiva/ui test` and `pnpm --filter @argiva/web test`. Expected: the four new assertions fail.
- [ ] **Step 3: Implement.** Hero renders a token-gradient `<div aria-hidden="true">` filling the media frame when `image` is absent. Home passes no image. Cart page replaces the checkout `ButtonLink` with the status sentence. Drawer replaces "Shipping calculated at checkout" with the brand sentence.
- [ ] **Step 4: Run** both again. Expected: PASS. Then `pnpm lint`: PASS (no hex, no unknown CSS variables).
- [ ] **Step 5: Checkpoint.**

### Task 3: Unavailable prices

**Files:**
- Modify: `apps/web/src/lib/catalog.ts`, `catalog.test.ts`
- Modify: `apps/web/src/app/collections/[slug]/collection-results.tsx`, `page.test.tsx`
- Modify: `packages/ui/src/components/ProductCard/ProductCard.tsx`, `ProductCard.module.css`, `ProductCard.test.tsx`
- Test: `apps/web/src/app/search/page.test.tsx`

**Interfaces:**
- Produces: `CatalogProduct.pricePaise: number | null`; `ProductCardProps.pricePaise: number | null`; private `priceOrNull(variant, currentRatePaise): number | null` in `catalog.ts`, used by cards and product detail.

- [ ] **Step 1: Write failing tests**, using the existing fixtures in each file:
  - `lists a rate-priced product with a null price when no rate is approved` (collection and search both return it, `pricePaise: null`).
  - `prefers the lowest priced variant over an unpriced one`.
  - `treats a fixed variant without a positive price as unavailable` for `fixedPricePaise` `null` and `0`, in `getProductsByCategory` and `getProductBySlug`; neither rejects.
  - `excludes unknown prices when a minimum or maximum price is set`.
  - ProductCard: `pricePaise={null}` shows `Price unavailable`, no `₹`, passes axe.
  - Collection page: with only unpriced products, no "Price range in rupees" group; with mixed, setting a maximum hides the unpriced card.
  - Update existing tests that expect unpriced products to be omitted.
- [ ] **Step 2: Run** UI and web tests. Expected: new tests fail (products omitted, errors thrown for invalid fixed price).
- [ ] **Step 3: Implement.** `priceOrNull` returns `null` for a missing or non-positive rate, or a fixed price that is not a positive integer; otherwise `calculateVariantPrice(...).finalPricePaise`. The price range uses known prices only and is `undefined` when there are none. `ProductCard` renders the text in place of `Price`.
- [ ] **Step 4: Run** UI and web tests, then `pnpm typecheck`. Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 4: Cart validation and modal drawer

**Files:**
- Modify: `apps/web/src/components/cart/cart-context.tsx`, `cart-context.test.tsx`
- Modify: `apps/web/src/components/cart/cart-drawer.tsx`, `cart-drawer.module.css`, `cart-drawer.test.tsx`
- Modify: `apps/web/vitest.setup.ts`

**Interfaces:**
- Produces: drawer is `<dialog>` with accessible name `Your Cart`; close button name `Close cart`.

- [ ] **Step 1: Write failing tests.** Context: entries with `pricePaise` `10.5`, `-1`, `Number.MAX_SAFE_INTEGER + 1`, or `pricePaise: Number.MAX_SAFE_INTEGER, quantity: 2` are ignored with the existing warning; `0` is kept. Drawer: dialog named `Your Cart` is open; `Close cart` has focus; closing returns focus to `Open cart`; firing a `cancel` event on the dialog closes it and `Open cart` reopens it; clicking the dialog element itself closes it; clicking inside the content does not.
- [ ] **Step 2: Run** web tests. Expected: FAIL.
- [ ] **Step 3: Implement validation:** `Number.isSafeInteger(pricePaise) && pricePaise >= 0 && Number.isSafeInteger(pricePaise * quantity)`.
- [ ] **Step 4: Add a jsdom polyfill** in `vitest.setup.ts`, only when `showModal` is missing: `showModal` sets `open`; `close` removes it and dispatches `close`.
- [ ] **Step 5: Implement the drawer** as `<dialog aria-labelledby>` with an inner element that fills it. An effect on open remembers `document.activeElement`, calls `showModal()`, focuses the close button; cleanup closes and restores focus. `onCancel` calls `preventDefault()` and `closeDrawer()`. `onClose` calls `closeDrawer()` only if the dialog is not open (a queued event from React's development double-run must not close a reopened drawer). `onClick` closes when `event.target` is the dialog. Replace the overlay with `::backdrop` and reset the default dialog margin, border, size and padding.
- [ ] **Step 6: Run** web tests and `pnpm lint`. Expected: PASS.
- [ ] **Step 7: Checkpoint.**

### Task 5: Migrations on every environment

**Files:**
- Create: `packages/db/migrate-runner.ts`, `packages/db/migrate-runner.test.ts`
- Modify: `packages/db/package.json`, `.github/workflows/deploy.yml`, `.github/workflows/ci.yml`, `scripts/smoke.mjs`
- Create: `scripts/workflows.test.mjs`, `scripts/smoke.test.mjs`

**Interfaces:**
- Produces: `runMigrations(connectionString: string): Promise<void>`; `pnpm --filter @argiva/db db:migrate` (needs `DATABASE_URL`).

- [ ] **Step 1: Write failing runner tests**, modelled on `seed-runner.test.ts` (spawn, 20 s timeout): the script is `tsx migrate-runner.ts`; with no `DATABASE_URL` it exits 1 and prints `DATABASE_URL is not set`; with port 1 it exits 1 and prints `ECONNREFUSED`.
- [ ] **Step 2: Write failing workflow and smoke tests.** `workflows.test.mjs` reads the YAML as text and asserts these appear in this order in `deploy.yml`: `Install database tools`, `google-github-actions/auth`, `Migrate database and load reference data`, `Deploy to Cloud Run`, `Smoke test`; and that `ci.yml` runs `db:migrate` and `db:seed` before `smoke.mjs`. `smoke.test.mjs` starts a local `node:http` fake that satisfies every check and expects exit 0, then returns 404 for `/policies/shipping` and expects exit 1 with `FAIL GET /policies/shipping` (60 s timeout; the script retries).
- [ ] **Step 3: Run** `pnpm --filter @argiva/db test` and `node --test "scripts/*.test.mjs"`. Expected: FAIL.
- [ ] **Step 4: Implement the runner** with `migrate` from `drizzle-orm/postgres-js/migrator`, a `postgres(url, { max: 1, prepare: false })` client closed in `finally`, and the `drizzle` folder resolved from the file's own location. It reads only `DATABASE_URL`; there is no fallback.
- [ ] **Step 5: Extend smoke** with: `GET /collections` is 200 and has an `<h1`; `GET /policies/shipping` is 200 and contains `Shipping`; `GET /search?q=silver` is 200.
- [ ] **Step 6: Edit `deploy.yml`.** Before the auth step (so package install scripts never see cloud credentials) add `pnpm/action-setup@v4` and `Install database tools`: `pnpm install --frozen-lockfile --filter "@argiva/db..."`. Between image build and deploy add the single step `Migrate database and load reference data`: read the secret named `$DATABASE_URL_SECRET` with `gcloud secrets versions access latest`, mask it with `::add-mask::`, export it for that step only (never `GITHUB_ENV`), set `STORAGE_DRIVER=local` and `STORAGE_LOCAL_DIR=/tmp/uploads`, then run `db:migrate` and `db:seed` with `set -euo pipefail`. `APP_ENV` and `APP_BASE_URL` come from the job env.
- [ ] **Step 7: Edit the CI `container` job.** After `docker compose up`, add pnpm setup, the same filtered install, then `db:migrate` and `db:seed` against `postgres://argiva:argiva_local_only@localhost:5432/argiva` with `APP_ENV=local`, `APP_BASE_URL=http://localhost:3000`, local storage; then smoke.
- [ ] **Step 8: Run** the Step 3 commands. Expected: PASS.
- [ ] **Step 9: Verify against a real database.** Start `postgres:17-alpine` as `argiva-plan-db` on `127.0.0.1:55432`; run migrate, seed, migrate, seed. Expected: four successes; 6 categories and 8 policies. Keep it for Task 6.
- [ ] **Step 10: Checkpoint.**

### Task 6: Browser tests

**Files:**
- Create: `apps/web/playwright.config.ts`, `apps/web/e2e/{prepare-database.ts,database-guard.ts,database-guard.test.ts,start-server.mjs,pages.spec.ts,catalog.spec.ts,cart.spec.ts,empty-shop.spec.ts,accessibility.spec.ts}`
- Modify: `apps/web/package.json`, `apps/web/tsconfig.json` (include `e2e`), `apps/web/vitest.config.ts` (include the guard test), root `package.json`, `pnpm-lock.yaml`, `.github/workflows/ci.yml`, `scripts/workflows.test.mjs`

**Interfaces:**
- Consumes: `runMigrations`, `seedDatabase`, `getDb(connectionString)`.
- Produces: `assertTestDatabaseUrl(url: string): void`; root `pnpm e2e` (after `pnpm build`); env `E2E_POSTGRES_URL`, the server URL without a database name, default the local compose server.

- [ ] **Step 1: Add dev dependencies** to `@argiva/web`: `@playwright/test`, `@axe-core/playwright`, `tsx`. Run `playwright install chromium`. If the download is blocked, set `channel: 'chrome'` for local runs only and record it.
- [ ] **Step 2: Write the guard test first:** accepts `postgres://u:p@127.0.0.1:5432/argiva_e2e` and `localhost`; throws for a remote host ending `_e2e`, for local database `argiva`, and for an unparseable string. Run, see FAIL, implement, see PASS.
- [ ] **Step 3: Implement `prepare-database.ts`.** For `argiva_e2e` and `argiva_empty_e2e`: guard, drop and recreate, then migrate twice and seed twice (Review Focus 4). Only `argiva_e2e` gets fixtures, none with a silver rate:

| Name | Category | Pricing | Finish | Stock |
| --- | --- | --- | --- | --- |
| Test Fixed Chain | chains-and-pendants | fixed 150000 | plain | 5 |
| Test Second Chain | chains-and-pendants | fixed 250000 | oxidised | 5 |
| Test Rate Anklet | anklets | silver_rate | oxidised | 5 |

- [ ] **Step 4: Configure Playwright.** `start-server.mjs` copies `.next/static` and `public` into the standalone output and runs its `server.js` with `APP_ENV=local`, local storage, and the given port and database. Two web servers: 3200 (`argiva_e2e`) and 3201 (`argiva_empty_e2e`), `reuseExistingServer: false`. Projects `phone` (Pixel 7) and `desktop` use 3200; `empty` uses 3201. Script `test:e2e`: `tsx e2e/prepare-database.ts && playwright test`.
- [ ] **Step 5: Write the specs.**
  - `pages`: `/`, `/collections`, all six collection slugs, the three product pages, `/cart`, `/search`, `/search?q=Test`, `/our-story`, `/faq`, `/contact`, eight policy pages, `/robots.txt`, `/sitemap.xml`: status 200, no console errors, no failed requests or responses ≥ 400 (ignore only aborted prefetches carrying `_rsc`), no `TODO(owner)`. Every same-origin link found responds < 400. `/search?q=%25_%3Cscript%3E` is 200 with `No products match your search.`
  - `catalog`: finish filter leaves one chain; maximum price 2000 leaves `Test Fixed Chain`; the anklet shows `Price unavailable`, has no price filter in its collection, and its add button is disabled.
  - `cart`: add `Test Fixed Chain`; dialog opens with focus on `Close cart`; ten Tab presses keep focus inside; Escape closes and focus returns; reopen from the header; cart page shows ₹1,500, the checkout sentence and no checkout link; reload keeps the item.
  - `empty-shop`: home, `/collections`, `/collections/anklets` (`There are no products in this collection yet.`), `/search?q=silver` and a policy page render without errors.
  - `accessibility`: axe tags `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa` on home, collection, product, cart, open drawer, search, contact, one policy; zero `serious` or `critical`.
- [ ] **Step 6: Run** `pnpm build` then `E2E_POSTGRES_URL=postgres://postgres:<throwaway>@127.0.0.1:55432 pnpm e2e`. First stop any dev server using this checkout, or ask the owner. For each failure, use systematic-debugging. Fix faults within the spec's scope with a failing test first. If an accessibility or other finding needs a design change, stop and ask the owner. Expected finally: all PASS.
- [ ] **Step 7: Add a CI job `e2e`** after `verify`: `postgres:17-alpine` service with a CI-only password, install, `playwright install --with-deps chromium`, build, `pnpm e2e`, upload the report on failure. Extend `workflows.test.mjs` to assert `pnpm e2e` appears. Run script tests: PASS.
- [ ] **Step 8: Checkpoint.**

### Task 7: Documentation and final verification

**Files:** `README.md`, `docs/setup.md`, `docs/runbook.md`, `docs/README.md`, `docs/decisions.md`, `docs/adr/README.md`, `docs/adr/0014-storefront-architecture.md`, `docs/adr/0015-migrations-and-browser-tests.md` (new), `apps/web/README.md`, `packages/db/README.md`, `packages/ui/README.md`, `docs/audit/2026-11-25-project-audit.md`, `sdd/state.json`, `sdd/phase-4-storefront.md`

- [ ] **Step 1: Setup guide.** Add the one-time command granting `roles/secretmanager.secretAccessor` to `$DEPLOYER_SA` on both database secrets, with why and the trade-off; correct section 3.7's statement about who can read them.
- [ ] **Step 2: Runbook.** Migrate and seed commands for local and deploy; deploy order; additive-migration rule and rollback; local reset (`docker compose down -v`, which deletes local data) for old invented rows; browser-test commands; the owner's missing business facts list; troubleshooting for a failed migration step; do not merge to `main` before the setup step.
- [ ] **Step 3: ADR 0015** (context, the options in the spec, decision, consequences), indexes, decisions log, package READMEs (new APIs and commands), docs index links to the spec and this plan, note in the audit of what is now fixed.
- [ ] **Step 4: Check** every relative link in changed Markdown files resolves.
- [ ] **Step 5: Fresh verification** using verification-before-completion: `pnpm test --force`, `pnpm typecheck --force`, `pnpm lint`, `pnpm build --force`, `pnpm e2e`, `git diff --check`. Report exact counts.
- [ ] **Step 6: Documented-commands run.** Empty throwaway database, follow only the runbook, run `node scripts/smoke.mjs` against it. If Docker permits without touching the owner's containers, also build the image. Expected: all `ok`. Remove the throwaway containers you created.
- [ ] **Step 7: Review** the whole diff with the requesting-code-review skill and fix real findings.
- [ ] **Step 8: Hand over.** State: owner commits, runs the setup command, opens a pull request, merges when CI passes, checks staging. Phase 4 stays in progress. Checkpoint.
