# Phase 4 Catalog Price Availability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Keep changes uncommitted; never git commit or git push.

**Goal:** Show silver-rate products when their price cannot be calculated, without inventing a price or hiding the product.

**Architecture:** Let `CatalogProduct.pricePaise` be nullable and carry unpriced products through the shared catalog projection. The shared `ProductCard` renders an unavailable-price label; collection and search price filters operate only on known prices.

**Tech Stack:** TypeScript, Next.js, React, `@argiva/domain`, `@argiva/ui`, Vitest, Testing Library.

**Spec:** [2026-11-24-phase-4-review-followup-design.md](../specs/2026-11-24-phase-4-review-followup-design.md), [brand-content.md](../../brand-content.md).

## Global Constraints

- Use only approved product data; never invent prices, purity, certifications, or other product facts.
- Keep money in integer paise; use `null` only to represent unavailable pricing.
- Continue using existing `--argiva-*` design tokens.
- Do not add dependencies or mutate database state.
- Leave all changes uncommitted; never git commit or git push.

## Review Focus

1. No approved rate: rate-priced products appear with `pricePaise: null`.
2. Fixed-price products remain priced when no rate is approved.
3. A product with both priced and unpriced variants uses its lowest known price.
4. Active price filters do not treat unknown prices as zero or as a matching range.
5. No known prices: the collection price-range filter is omitted rather than calculated from an empty set.

---

### Task 1: Carry Unavailable Pricing Through Catalog Cards

**Files:**
- Modify: `apps/web/src/lib/catalog.ts`
- Test: `apps/web/src/lib/catalog.test.ts`
- Modify: `apps/web/src/app/collections/[slug]/collection-results.tsx`
- Test: `apps/web/src/app/collections/[slug]/collection-results.test.tsx` (create)
- Modify: `apps/web/src/app/search/page.tsx`
- Test: `apps/web/src/app/search/page.test.tsx`
- Modify: `packages/ui/src/components/ProductCard/ProductCard.tsx`
- Test: `packages/ui/src/components/ProductCard/ProductCard.test.tsx`

**Interfaces:**
- Consumes: `CatalogProduct`, category/search queries, and `ProductCard`.
- Produces: `CatalogProduct.pricePaise: number | null`; `getProductsByCategory` and `getSearchProducts` continue returning `Promise<CatalogProduct[]>`; `ProductCardProps.pricePaise: number | null`.

- [ ] **Step 1: Write failing catalog tests**

Replace the existing no-rate omission expectations with tests that collection and search results include silver-rate products at `pricePaise: null`; retain fixed-price products; and choose the lowest known price when a product has both priced and unpriced variants. Add a test that a price filter excludes unpriced products.

- [ ] **Step 2: Run the focused catalog tests and confirm failure**

Run: `npx --loglevel=error pnpm@12.16.1 --filter @argiva/web test catalog.test.ts`

Expected: FAIL because the catalog currently discards rate-priced variants when no approved rate exists.

- [ ] **Step 3: Write failing card and page tests**

Add tests that `ProductCard` renders “Price unavailable” for a `null` price, collection results render a product with unavailable pricing, price ranges are derived only from priced products, and search results preserve unpriced products.

- [ ] **Step 4: Run focused UI and web tests and confirm failure**

Run: `npx --loglevel=error pnpm@12.16.1 --filter @argiva/ui test ProductCard.test.tsx`

Run: `npx --loglevel=error pnpm@12.16.1 --filter @argiva/web test collection-results.test.tsx search/page.test.tsx`

Expected: FAIL on the nullable price contract and missing unavailable-price rendering.

- [ ] **Step 5: Implement the nullable price projection**

Update the internal catalog projection to keep unpriced rate-based variants, prefer the lowest priced variant for a product when one exists, and use `null` when all its variants are unpriced. Apply price bounds only to products with known prices.

- [ ] **Step 6: Implement the unavailable-price card and safe filters**

Allow `ProductCard` to accept a nullable `pricePaise`; render “Price unavailable” instead of passing `null` to `Price`. In collection results, derive `priceRange` from known prices only and omit it when none exist. Keep collection and search rendering consistent.

- [ ] **Step 7: Run focused package tests**

Run:

```bash
npx --loglevel=error pnpm@12.16.1 --filter @argiva/web test catalog.test.ts collection-results.test.tsx search/page.test.tsx
npx --loglevel=error pnpm@12.16.1 --filter @argiva/ui test ProductCard.test.tsx
```

Expected: PASS; known price calculations and filters remain unchanged.
