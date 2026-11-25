# Phase 4 Seed and Policy Safety Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Keep changes uncommitted; never git commit or git push.

**Goal:** Keep invented catalog/rate data and unconfirmed policy or seller assertions out of the database seed.

**Architecture:** Keep `initialSeedData` limited to supported categories and policies. `seedDatabase` inserts those records only; unconfirmed proposed policy and seller details remain explicit owner-confirmation placeholders.

**Tech Stack:** TypeScript, Drizzle ORM, `@argiva/db`, Vitest.

**Spec:** [2026-11-24-phase-4-review-followup-design.md](../specs/2026-11-24-phase-4-review-followup-design.md), [brand-content.md](../../brand-content.md).

## Global Constraints

- Use only approved material from `docs/brand-content.md`; never invent product or legal facts.
- Keep all policy records in `draft` status.
- Retain source-backed shipping and care copy; use owner-confirmation placeholders for proposed returns/cancellation terms and unconfirmed seller disclosures.
- Do not apply migrations, run the seed against any database, or otherwise mutate database state.
- Leave all changes uncommitted; never run `git commit` or `git push`.

## Review Focus

1. Synthetic products, variants, approved rates, and the related sample owner account are absent from seed data.
2. The six approved category slugs remain seeded.
3. Every seeded policy remains a draft.
4. Proposed returns and cancellation terms remain owner-confirmation placeholders.
5. Seller entity, grievance-officer status, and jurisdiction are not asserted without owner confirmation.

---

### Task 1: Remove Unverified Seed Records and Claims

**Files:**
- Modify: `packages/db/src/seed.ts`
- Test: `packages/db/src/seed.test.ts`
- Modify: `packages/db/README.md`

**Interfaces:**
- Consumes: `initialSeedData` and `seedDatabase(db: PostgresJsDatabase<typeof schema>): Promise<void>`.
- Produces: `initialSeedData` with only `categories` and `policies`; `seedDatabase` inserts categories and policies only.

- [ ] **Step 1: Add failing seed assertions**

Add tests named `seedsOnlyApprovedCategoriesAndPolicies`, `keepsProposedPoliciesAsOwnerPlaceholders`, and `usesConfirmationPlaceholdersForSellerDisclosures`. Assert that there are six approved category slugs; `initialSeedData` has no users, products, variants, or silver rate; policy statuses are all `draft`; returns/cancellation content asks the owner to confirm terms; and disclosures do not assert entity type, grievance-officer status, or jurisdiction.

- [ ] **Step 2: Run the focused database tests and confirm failure**

Run: `npx --loglevel=error pnpm@12.16.1 --filter @argiva/db test seed.test.ts`

Expected: FAIL because the seed currently exposes synthetic catalog/rate records and unconfirmed policy/disclosure statements.

- [ ] **Step 3: Remove synthetic seed records and replace unconfirmed claims**

In `seed.ts`, remove the sample user, products, variants, approved silver rate, associated imports/constants, and their insert operations. Keep supported categories and policy rows. Replace proposed returns/cancellation claims and unsupported seller facts with concise `TODO(owner)` confirmation text; keep the policies in draft status.

- [ ] **Step 4: Update the database README**

Document that `db:seed` inserts approved categories and draft policies only; verified catalog records and silver rates must be supplied through the approved owner workflow.

- [ ] **Step 5: Run the database suite**

Run: `npx --loglevel=error pnpm@12.16.1 --filter @argiva/db test`

Expected: PASS with no seed execution against a database.
