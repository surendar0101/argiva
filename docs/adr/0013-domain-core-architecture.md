# 0013. Domain core architecture and separation of pure business logic

- Status: Accepted
- Date: 2026-11-11
- Deciders: Owner (+ agent)

## Context
E-commerce operations for silver jewellery require strict compliance with purity descriptions (Brand Content §5) and immutable historical pricing for orders when silver spot rates change (ADR 0007). In addition, Neon serverless Postgres uses PgBouncer in transaction pooling mode, which does not support prepared statements.

## Options considered
- Embed database operations and business logic directly in Next.js Server Actions or API routes. (Rejected: hard to test in isolation, couples business rules to database and web framework).
- Separate into two decoupled packages:
  - `@argiva/db`: Drizzle ORM schema, migrations, connection configuration (`prepare: false`), and database operations.
  - `@argiva/domain`: Pure TypeScript business logic (composition labelling, pricing engine, order snapshots, stock reservations) with zero database dependencies.

## Decision
- **Decoupled Architecture:** `@argiva/domain` encapsulates pure business algorithms without I/O or database dependencies, enabling comprehensive, fast unit test coverage. `@argiva/db` manages schema, relationships, and connection pooling.
- **Neon PgBouncer Compatibility:** Drizzle's `postgres` client is explicitly configured with `prepare: false` to ensure reliable pooling across serverless instances and autosuspend.
- **Strict Labelling Enforcement:** The composition label generator rejects "925 sterling silver" unless purity is verified. 80% and 60% silver explicitly declare remaining content as other metals.
- **Immutable Pricing Snapshots:** Order line items store a complete `pricing_snapshot` JSON payload capturing all calculation inputs at the moment of checkout. Recalculation verifies that subsequent spot rate changes never alter historical orders.
- **Integer Paise Representation:** All monetary amounts are handled as integer paise (`bigint` or `integer`) to eliminate floating point rounding errors.

## Consequences
- Testing domain rules requires no database spin-up or mock servers.
- Storefront and admin modules consume `@argiva/domain` for client/server shared logic and `@argiva/db` for database queries.
