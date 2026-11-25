# Phase 3: Domain Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Never `git commit` or `git push`.** Each task ends with a checkpoint instead: update `sdd/state.json`, append to `sdd/phase-3-domain-core.md`, and leave the change for the owner to review.

**Goal:** Build the domain core: database schema and migrations (`packages/db`) using Drizzle ORM, pure domain logic (`packages/domain`) for composition labels, pricing engine (fixed and silver-rate formulas with integer paise arithmetic), order price snapshots (ensuring later rate changes never alter old orders per ADR 0007), stock reservation, seed data, and comprehensive test suites.

**Architecture:**
- `packages/db`: Drizzle ORM schema definitions (`users`, `categories`, `products`, `product_variants`, `silver_rates`, `orders`, `order_items`, `stock_reservations`, `audit_logs`) and database connection utilities configured with `prepare: false` for Neon / PgBouncer connection pooling compatibility.
- `packages/domain`: Pure TypeScript business logic functions with zero database dependencies:
  - Composition label generator enforcing brand content §5 (verified 92.5 sterling silver, 80%, 60%, purity badges).
  - Pricing engine supporting `fixed` and `silver_rate` modes, calculation of item prices in integer paise, and building complete order price snapshots (ADR 0007).
  - Stock reservation and expiration rules.
- Tests: Vitest unit tests for all domain functions and integration tests for Drizzle schema and queries.

**Tech Stack:**
- TypeScript 6.0, Drizzle ORM, `postgres` (porsager), Zod 4, Vitest 5.

**Spec:** [docs/plans/README.md](README.md) § Phase 3, ADR 0006, ADR 0007, and `docs/brand-content.md` §5 & §10.

## Global constraints

- Package manager: always write `npx --loglevel=error pnpm@12.16.1 ...` inline. In zsh, quote `'@argiva/x@workspace:*'`.
- Node `>=22`. Workspaces: `apps/*` and `packages/*`.
- **Never `git commit` or `git push`.**
- No hard-coded prices, domains, or business constants; use centralized config or domain formulas.
- Money stored as integer paise (`bigint` or `integer`), never floating point.
- All domain rules must be fully tested with Vitest.

## Review Focus

1. **Silver Rate Mutation Isolation:** A subsequent update to `silver_rates` or a recalculation of silver spot price must not mutate historical order line snapshots (ADR 0007). Tested explicitly in pricing tests.
2. **Purity Labelling Compliance:** Unverified silver cannot carry a "925 sterling silver" label (brand content §5). Tested in composition label tests.
3. **Integer Arithmetic Precision:** All monetary values (paise) must use integer arithmetic to prevent floating point rounding drift. Tested in pricing engine tests.
4. **Stock Reservation Expiry:** Expired stock reservations must be automatically released back to available inventory. Tested in reservation tests.
5. **Neon Connection Pooling Compatibility:** Drizzle connection configured with `prepare: false` for PgBouncer transaction mode.

---

### Task 1: Create `packages/db` with Drizzle Schema and Migrations

**Files:**
- Create: `packages/db/package.json`
- Create: `packages/db/tsconfig.json`
- Create: `packages/db/drizzle.config.ts`
- Create: `packages/db/src/schema.ts`
- Create: `packages/db/src/index.ts`
- Create: `packages/db/vitest.config.ts`
- Create: `packages/db/src/schema.test.ts`
- Modify: `pnpm-workspace.yaml` (ensure packages/db included if needed, or covered by `packages/*`)

**Interfaces:**
- Consumes: `@argiva/config` for `databaseUrl`.
- Produces: Drizzle database client instance, schema table exports (`users`, `categories`, `products`, `productVariants`, `silverRates`, `orders`, `orderItems`, `stockReservations`, `auditLogs`), and type definitions.

- [x] **Step 1: Create `packages/db/package.json`**
```json
{
  "name": "@argiva/db",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc --noEmit",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate"
  },
  "dependencies": {
    "@argiva/config": "workspace:*",
    "drizzle-orm": "^0.39.0",
    "postgres": "^3.4.5"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "drizzle-kit": "^0.30.4",
    "typescript": "^6.0.3",
    "vitest": "^3.0.0"
  }
}
```

- [x] **Step 2: Create `packages/db/tsconfig.json`**
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src/**/*"]
}
```

- [x] **Step 3: Create `packages/db/drizzle.config.ts`**
```ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/argiva_dev',
  },
} satisfies Config;
```

- [x] **Step 4: Create `packages/db/src/schema.ts`**
Define tables with Drizzle (`pgTable`, `uuid`, `text`, `integer`, `boolean`, `timestamp`, `jsonb`, etc.) for users, categories, products, product_variants, silver_rates, orders, order_items, stock_reservations, audit_logs.

- [x] **Step 5: Create `packages/db/src/index.ts`**
Export Drizzle client initialized with `postgres(databaseUrl, { prepare: false })` and schema definitions.

- [x] **Step 6: Create `packages/db/src/schema.test.ts`**
Write a test validating table exports and schema structure.

- [x] **Step 7: Run tests & typecheck**
Run: `npx --loglevel=error pnpm@12.16.1 --filter @argiva/db test`
Expected: PASS

---

### Task 2: Create `packages/domain` for Pure Domain Logic & Pricing Engine

**Files:**
- Create: `packages/domain/package.json`
- Create: `packages/domain/tsconfig.json`
- Create: `packages/domain/src/composition.ts`
- Create: `packages/domain/src/composition.test.ts`
- Create: `packages/domain/src/pricing.ts`
- Create: `packages/domain/src/pricing.test.ts`
- Create: `packages/domain/src/reservation.ts`
- Create: `packages/domain/src/reservation.test.ts`
- Create: `packages/domain/src/index.ts`
- Create: `packages/domain/vitest.config.ts`

**Interfaces:**
- Consumes: None (pure business logic).
- Produces:
  - `generateCompositionLabel(purity, verified, finish)` -> string label conforming to brand content §5.
  - `calculateVariantPrice(variant, silverRate, formulaVersion)` -> pricing output with paise integer precision and full input audit trail.
  - `createOrderSnapshot(cartItems, silverRates)` -> immutable order line snapshot containing all pricing inputs and rates.
  - `isReservationValid(reservation)` -> boolean.

- [x] **Step 1: Create `packages/domain/package.json`**
```json
{
  "name": "@argiva/domain",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc --noEmit",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^6.0.3",
    "vitest": "^3.0.0"
  }
}
```

- [x] **Step 2: Create composition label generator & tests (`src/composition.ts`, `src/composition.test.ts`)**
Implement strict checks: unverified silver cannot be labelled "925 sterling silver". Write tests covering 92.5%, 80%, 60% purities and verified vs unverified states.

- [x] **Step 3: Create pricing engine & tests (`src/pricing.ts`, `src/pricing.test.ts`)**
Implement fixed pricing and silver-rate-based formula calculation (weight * base_rate * purity_multiplier + making_charges + GST handling, with integer paise rounding). Write tests verifying that updating silver rates does not alter previously generated order snapshots (Review Focus 1).

- [x] **Step 4: Create stock reservation & tests (`src/reservation.ts`, `src/reservation.test.ts`)**
Implement stock reservation and timeout expiry logic. Write tests.

- [x] **Step 5: Run tests & typecheck**
Run: `npx --loglevel=error pnpm@12.16.1 --filter @argiva/domain test`
Expected: PASS

---

### Task 3: Seed Data & Database Integration Tests

**Files:**
- Create: `packages/db/src/seed.ts`
- Create: `packages/db/src/seed.test.ts`

**Interfaces:**
- Consumes: `@argiva/db`, `@argiva/domain`.
- Produces: Database seed script populating initial sample categories, products, variants, and silver rates.

- [x] **Step 1: Write seed script (`packages/db/src/seed.ts`)**
Insert initial categories (Necklaces, Anklets, Earrings, Rings, Bangles), sample products and variants (mix of fixed price and silver-rate based), and active silver rate.

- [x] **Step 2: Write integration test (`packages/db/src/seed.test.ts`)**
Test database connection, seeding, and querying product variants with composition labels and pricing.

- [x] **Step 3: Run integration tests**
Run: `npx --loglevel=error pnpm@12.16.1 --filter @argiva/db test`
Expected: PASS

---

### Task 4: Documentation Backfill & Phase 3 Wrap-up

**Files:**
- Modify: `README.md`
- Modify: `docs/setup.md`
- Modify: `docs/runbook.md`
- Modify: `docs/README.md`
- Create: `packages/db/README.md`
- Create: `packages/domain/README.md`
- Create: `docs/adr/0013-domain-core-architecture.md`
- Create: `sdd/phase-3-domain-core.md`
- Modify: `sdd/state.json`

**Interfaces:**
- Produces: Complete phase documentation and state update.

- [x] **Step 1: Write ADR 0013 and update docs index (`docs/README.md`)**
Document domain core design decisions, purity enforcement, and immutable order snapshots.

- [x] **Step 2: Write package READMEs for `packages/db` and `packages/domain`**
- [x] **Step 3: Update root `README.md`, `docs/setup.md`, and `docs/runbook.md`**
- [x] **Step 4: Update `sdd/state.json` and create `sdd/phase-3-domain-core.md`**
- [x] **Step 5: Run full test suite & typecheck across workspace**
Run: `pnpm test && pnpm typecheck`
Expected: PASS
