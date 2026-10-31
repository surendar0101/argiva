# 0004. Tech stack: TypeScript modular monolith

- Status: Accepted
- Date: 2026-10-31
- Deciders: Owner (+ agent)

## Context
The owner (a developer) maintains the system with help from AI agents. The business needs things off-the-shelf platforms handle poorly: pricing tied to the silver rate, a copy of the price inputs kept with every order, labelling purity per variant, maker-checker approvals and a custom permission matrix. It must run inside the budget in [0003](0003-cloud-hosting.md).

## Options considered
- **A. Custom modular monolith** (TypeScript, Next.js, Postgres, Drizzle). Full control and one deployable; we build the commerce features ourselves.
- **B. Medusa.js v2 with a Next.js storefront.** Products, variants, cart, orders and regions come built in. But it is a second service to host, and silver-rate pricing and the maker-checker workflow would fight its model.
- **C. Shopify.** The Basic plan (about ₹3300 a month) already exceeds the budget, and silver-rate pricing and price snapshots depend on third-party apps.

## Decision
Option A:
- **Language and repo:** TypeScript (strict) in pnpm workspaces with Turborepo.
- **App:** Next.js with standalone Docker output, serving the storefront and `/admin` from one app.
- **Data and validation:** PostgreSQL with Drizzle ORM; Zod for all input validation.
- **Auth:** Better Auth plus a custom role and permission matrix (see [0008](0008-admin-rbac-maker-checker.md)).
- **Integrations:** each sits behind an interface (payments, email, storage, shipping) so providers can be swapped.

## Consequences
- We build and test cart, checkout, orders and inventory ourselves. In return, there is no platform tax and no fight with a framework's data model.
- One image to deploy keeps hosting inside the free tier.
- Module boundaries (catalog, pricing, orders, payments, admin, content) are enforced by package structure, so modules can be split out later if needed.
