# @argiva/db

PostgreSQL database schema, Drizzle ORM models, migrations, and database connection utilities for the ARGIVA platform.

## Overview

- **ORM:** Drizzle ORM (`drizzle-orm/postgres-js`).
- **Driver:** `postgres` (porsager).
- **Pooling Compatibility:** Client connections configured with `prepare: false` to support Neon / PgBouncer connection pooling in transaction mode.
- **Precision:** All monetary amounts are stored as integer paise (`bigint` or `integer`), never floating point.

## Schema Tables

- `users`: Administrative and staff users with roles (`owner`, `manager`, `catalog_editor`, `fulfilment`, `support`).
- `categories`: Catalog categories / collections (Chains & Pendants, Earrings, Bangles & Bracelets, Anklets, Rings, Silver Gifting).
- `policies`: Database-managed policy pages with structured content blocks and `draft` / `published` status.
- `products`: Product catalog entries with descriptions, care instructions, and return eligibility policies.
- `product_variants`: Variant-level details (SKU, weight, purity grade, finish, pricing mode, fixed price, making charges, stock, is_pair).
- `silver_rates`: Silver benchmark rates per gram in paise with maker-checker approval records.
- `orders`: Customer orders, shipping details, total amounts in paise, packaging video and invoice URLs.
- `order_items`: Order line items with an immutable `pricing_snapshot` preserving all historical pricing inputs per ADR 0007.
- `stock_reservations`: Temporary inventory holds with TTL for active checkout sessions.
- `audit_logs`: Audit trail for admin actions and rate approvals.

## Scripts

```bash
# Typecheck schema and client
pnpm --filter @argiva/db typecheck

# Run unit and integration tests
pnpm --filter @argiva/db test

# Seed the configured database after confirming the target and applying migrations
pnpm --filter @argiva/db db:seed

# Generate Drizzle migration files
pnpm --filter @argiva/db db:generate

# Apply migrations
pnpm --filter @argiva/db db:migrate
```

`src/seed.ts` exports `seedDatabase(db)` and includes the initial catalog and draft policy rows. The `db:seed` CLI creates a configured database connection, passes it to the seed function, and closes the pool on success or failure. It does not apply migrations. See the [runbook's storefront schema and content readiness section](../../docs/runbook.md#storefront-schema-and-content-readiness) for the local environment setup and target-safety steps.
