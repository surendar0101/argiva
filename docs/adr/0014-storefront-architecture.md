# 0014. Storefront architecture and draft policy rendering

- Status: Proposed
- Date: 2026-11-24
- Deciders: Owner review pending

## Context

Phase 4 adds a catalog storefront, search and cart, customer-information pages, database-backed policy pages, and search-engine metadata. The existing stack uses Next.js, PostgreSQL and Drizzle, and the accepted policy decision in [ADR 0009](0009-legal-policy-pages.md) requires policy content to remain database-managed and draft until approved.

The storefront needs server-rendered catalog data and page metadata without introducing another content service. Cart, filter and variant-selection interactions need browser state, but checkout, customer accounts and policy administration are not part of this phase.

## Options considered

- Hard-code catalog and policy content in page components. Rejected: product and policy content belongs in the database, and hard-coded policy copy would bypass the accepted draft-to-publish decision.
- Use server-rendered App Router pages with small client components for interactions and existing database/domain packages for data and rules. Chosen: it keeps server data access and SEO close to the route while limiting browser-only state.
- Add a separate CMS or commerce service. Rejected for this phase: it adds an account, integration and operational surface without being needed by the storefront scope.

## Decision

- Use Next.js 16 App Router pages and server components for catalog and policy reads, metadata, sitemap generation and structured data.
- Keep browser interactions in client components, including filters and product variant selection. The cart uses a validated `useSyncExternalStore` snapshot persisted in local storage, with an empty server snapshot and an in-memory fallback if browser storage is unavailable. It is not an order or payment system and does not synchronize between tabs.
- Read the public Instagram profile from optional typed `INSTAGRAM_URL` configuration for contact/footer links and Organization JSON-LD; preserve the approved handle when the URL is unset. Keep Schema.org vocabulary identifiers literal in structured data.
- Use `@argiva/db` for persisted catalog/policy data and `@argiva/domain` for pricing and composition rules.
- Store policy content as structured database blocks with `draft` or `published` status. Render a visible draft notice for draft records; do not invent missing legal or seller facts. Owner/legal review is required before publication.
- Build canonical metadata from `APP_BASE_URL` and existing product SEO fields, with database product name/description fallbacks. Generate the sitemap from active categories, published products and stored policy slugs, including draft policy slugs. Disallow indexing outside production.
- Escape JSON-LD script content before embedding it in pages.

## Consequences

- The relevant database migrations and content rows must exist before database-backed routes can serve them. The storefront does not do this at startup; deploys do it first ([ADR 0015](0015-migrations-and-browser-tests.md)).
- The `db:seed` command holds reference data only (categories and draft policies), with no sample products or silver rate.
- There is no policy administration UI in this phase. Publishing remains an owner-controlled follow-up, and the policy content must stay draft until approved.
- Draft policy URLs are public and included in the sitemap, so search engines may discover draft copy before sign-off. Revisit this choice if public discovery is not acceptable.
- Cart state is limited to the browser and does not reserve stock, create orders or initiate payments. Checkout and payment behavior belongs to a later phase.
- The project adds no external CMS or storefront service.
