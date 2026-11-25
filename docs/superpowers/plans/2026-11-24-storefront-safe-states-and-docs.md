# Phase 4 Storefront Safe States and Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Keep changes uncommitted; never git commit or git push.

**Goal:** Remove the broken homepage/cart destinations and complete Phase 4 documentation after all review fixes are integrated.

**Architecture:** Let the shared Hero render an optional token-based decorative placeholder when no approved image is available. Replace the missing checkout link with non-interactive status copy; keep checkout out of Phase 4.

**Tech Stack:** TypeScript, React, Next.js, CSS Modules, Vitest, Testing Library.

**Spec:** [2026-11-24-phase-4-review-followup-design.md](../specs/2026-11-24-phase-4-review-followup-design.md), [2026-11-12-storefront-design.md](../specs/2026-11-12-storefront-design.md), [brand-content.md](../../brand-content.md).

## Global Constraints

- Use a neutral local placeholder only; third-party retailer imagery is prohibited.
- Use existing `--argiva-*` tokens; do not add hardcoded colors or new dependencies.
- Do not add a `/checkout` route or imply that checkout is available.
- Complete the Phase 4 documentation checklist before marking the phase done.
- Leave all changes uncommitted; never git commit or git push.

## Review Focus

1. Homepage renders without requesting the missing `/placeholder-hero.jpg`.
2. The decorative hero placeholder is hidden from assistive technology and does not imply product photography.
3. Existing approved Hero image callers continue to render their images.
4. Cart summary remains intact while checkout is unavailable.
5. No page links to the nonexistent `/checkout` route.

---

### Task 1: Add Honest Homepage and Checkout States

**Files:**
- Modify: `packages/ui/src/components/Hero/Hero.tsx`
- Modify: `packages/ui/src/components/Hero/Hero.module.css`
- Modify: `apps/web/src/app/page.tsx`
- Test: `apps/web/src/app/page.test.tsx`
- Modify: `apps/web/src/app/cart/page.tsx`
- Modify: `apps/web/src/app/cart/page.module.css`
- Test: `apps/web/src/app/cart/page.test.tsx`

**Interfaces:**
- Consumes: current `Hero` props and cart summary.
- Produces: `Hero` with optional `image?: ImageData`; when omitted, it renders a decorative token-styled placeholder. The cart page reports that online checkout is not available yet and contains no `/checkout` link.

- [ ] **Step 1: Add failing homepage placeholder tests**

Test that the homepage renders a `[data-placeholder="true"]` hero media frame marked `aria-hidden="true"` without an `<img>` pointed at `/placeholder-hero.jpg`, and that the approved hero headline and collection links remain present.

- [ ] **Step 2: Run the homepage tests and confirm failure**

Run: `npx --loglevel=error pnpm@12.16.1 --filter @argiva/web test page.test.tsx`

Expected: FAIL because the homepage still passes the missing image path.

- [ ] **Step 3: Add optional Hero media**

Make the `image` prop optional. Render the existing image when provided; otherwise render a decorative media frame marked `aria-hidden="true"` and style it only with existing hero/design tokens. Remove the missing image argument from the homepage.

- [ ] **Step 4: Add failing cart checkout-boundary test**

Test that a populated cart shows a status explaining that online checkout is not available yet and has no link whose `href` is `/checkout`; retain the subtotal and shipping note assertions.

- [ ] **Step 5: Run the cart-page test and confirm failure**

Run: `npx --loglevel=error pnpm@12.16.1 --filter @argiva/web test cart/page.test.tsx`

Expected: FAIL because the current CTA links to `/checkout`.

- [ ] **Step 6: Replace the checkout link with status copy**

Remove the `ButtonLink` to `/checkout`, add non-interactive status text, and update the status styling with existing design tokens. Do not add a checkout route.

- [ ] **Step 7: Run the focused page tests**

Run: `npx --loglevel=error pnpm@12.16.1 --filter @argiva/web test page.test.tsx cart/page.test.tsx`

Expected: PASS; existing home and cart content remains available.

### Task 2: Run Final Workspace Verification

**Files:**
- Verify all files changed by the four review-follow-up plans.

**Interfaces:**
- Consumes: completed seed/policy, catalog, cart, and storefront changes.
- Produces: fresh verification evidence for the Phase 4 completion checklist.

- [ ] **Step 1: Run workspace tests**

Run: `npx --loglevel=error pnpm@12.16.1 test`

Expected: all six Turbo package tasks and root script tests pass.

- [ ] **Step 2: Run typecheck, lint, and production build**

Run:

```bash
npx --loglevel=error pnpm@12.16.1 typecheck
npx --loglevel=error pnpm@12.16.1 lint
npx --loglevel=error pnpm@12.16.1 build
```

Expected: all commands exit successfully without deployment environment variables.

- [ ] **Step 3: Check whitespace and scope**

Run: `git diff --check`

Expected: clean diff; no database was seeded and no commit or push was made.

### Task 3: Complete Phase 4 Documentation

**Files:**
- Modify: `README.md`
- Modify: `docs/setup.md`
- Modify: `docs/runbook.md`
- Modify: `docs/README.md`
- Modify: `apps/web/README.md`
- Modify: `packages/db/README.md`
- Modify: `packages/ui/README.md`
- Modify: `docs/adr/0006-catalog-variant-model.md`
- Modify: `docs/adr/0009-legal-policy-pages.md`
- Modify: `docs/adr/0014-storefront-architecture.md`
- Modify: `docs/plans/2026-11-12-phase-4-storefront.md`
- Modify: `sdd/state.json`
- Modify: `sdd/phase-4-storefront.md`
- Modify: `.superpowers/sdd/2026-11-12-phase-4-storefront/progress.md`

**Interfaces:**
- Consumes: final behavior and fresh verification evidence from Tasks 1–2 and the other review-follow-up plans.
- Produces: synchronized owner setup, operations, architecture, package, plan, index, and SDD records. Task 8 and Phase 4 remain in progress until every plan checkbox and acceptance criterion is verified.

- [ ] **Step 1: Update operational and package documentation**

Describe the safe seed contents, unavailable-price state, unavailable checkout boundary, and neutral hero treatment in the relevant READMEs, setup guide, and runbook. Do not document fabricated catalog, seller, or policy details.

- [ ] **Step 2: Update relevant ADRs and the docs index**

Align the catalog, legal-policy, and storefront-architecture ADRs with the approved review follow-up; update `docs/README.md` to index the design and implementation plans.

- [ ] **Step 3: Record final Phase 4 evidence**

Update the canonical Phase 4 plan's Task 8 checklist, `sdd/state.json`, and both Phase 4 logs with only freshly verified results and any remaining owner-supplied catalog/legal data requirements.

- [ ] **Step 4: Validate documentation and state**

Run: `node -e 'JSON.parse(require("node:fs").readFileSync("sdd/state.json", "utf8")); console.log("state.json valid")'`

Run: `git diff --check`

Expected: valid JSON, clean diff, and no Phase 4 completion marker while any acceptance item remains unverified.
