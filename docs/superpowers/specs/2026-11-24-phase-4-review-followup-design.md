# Phase 4 Review Follow-up Design

## Intent

Close the verified review gaps in the Phase 4 storefront without expanding into Phase 5 checkout or presenting fictional product, pricing, policy, or seller facts as real. The storefront should remain honest and usable while the owner supplies verified catalog data and approves legal content.

## Goals

- Replace the homepage's missing hero image with a neutral, local, token-based placeholder treatment.
- Remove the cart's link to a checkout route that does not exist yet.
- Keep unverified product and pricing data out of the database seed.
- Show products with unavailable silver-rate pricing without inventing a price or silently hiding them.
- Reject invalid persisted paise values and make the cart drawer a keyboard-accessible modal.
- Replace unconfirmed cancellation and seller-disclosure assertions with owner-confirmation placeholders.
- Update focused tests and directly related documentation; keep all changes uncommitted.

## Non-goals

- Implement checkout, payment, order creation, refunds, or any other Phase 5 behavior.
- Invent product records, product photography, silver rates, legal text, seller identity, grievance contacts, or jurisdiction.
- Apply migrations, run the seed against any database, or otherwise mutate database state.
- Add dependencies or change unrelated Phase 4 behavior.

## Constraints

- Use only approved material from [brand-content.md](../../brand-content.md). The source requires verified composition before describing products as 925 sterling silver, says third-party retailer imagery must not be used, and marks the returns policy as proposed.
- Keep all policy records in `draft` status. Keep source-backed shipping and care copy; use owner-confirmation placeholders for proposed cancellation/returns terms and unconfirmed seller disclosures.
- Continue using integer paise for money and existing `--argiva-*` design tokens for styling.
- Preserve Phase 5 as a separate phase; no `/checkout` route is added.
- No database mutation, `git commit`, or `git push`.

## Approaches

1. **Truthful prelaunch cleanup (selected):** Remove synthetic catalog/rate seed data and unsupported legal/seller assertions; provide clear unavailable-price, checkout, and hero states; harden the cart. This keeps the current architecture and avoids unsupported claims.
2. **Draft-only sample catalog:** Retain invented records as unpublished development drafts. This preserves database-backed visual data but leaves misleading values in the seed and requires extra controls to guarantee drafts never surface.
3. **Defer all changes:** Leave the review gaps until verified product/policy data or checkout exists. This avoids code changes but leaves broken or misleading storefront behavior in the meantime.

The owner selected the first approach, including a neutral local homepage placeholder and removal of unverified database seed products/rates. Third-party imagery remains prohibited.

## Design and behavior

### Homepage hero

Use the existing Hero media frame with a decorative, locally rendered placeholder styled only with existing design tokens. It must not depict a specific product or imply that ARGIVA has supplied photography. Mark the decorative media as hidden from assistive technology. Do not add a remote image, third-party photo, or new image dependency.

### Cart and checkout boundary

Keep the cart summary and item controls. Replace the `/checkout` link with non-interactive status copy that clearly says online checkout is not available yet. Do not create a checkout route or imply that an order can be placed.

### Seed and policy content

- Keep seeded categories, since their names and descriptions come from approved brand content.
- Remove the synthetic owner account, sample products, sample variants, and synthetic approved silver rate from `initialSeedData` and `seedDatabase`. The owner account exists only to attribute the synthetic rate; no remaining seed record needs it.
- Keep policy records in draft status. Retain the source-backed shipping and care drafts. Replace proposed returns/cancellation claims with `TODO(owner)` confirmation text. In seller disclosures, remove unsupported claims about entity type, grievance-officer status, and jurisdiction; leave confirmation placeholders for the legal entity/name, address, grievance contact, and jurisdiction.
- Update seed tests to assert the approved categories and draft/placeholder policy behavior rather than calculate prices for fictional products.

### Catalog pricing unavailable state

Represent a catalog product's card price as either integer paise or `null`. When no approved rate exists, include rate-priced products in collection and search results with a neutral “Price unavailable” label rather than a fabricated amount or silent omission. If a product has at least one priced variant, continue showing its lowest priced variant. Price-range filtering applies only when a price is known; hide the price filter if there are no priced products. Keep product-detail behavior consistent with its existing unavailable-price state.

### Persisted cart validation

Require `pricePaise` from persisted local storage to be a non-negative safe integer. Ignore entries with fractional or unsafe integer prices, using the existing malformed-cart warning behavior. Do not broaden validation or change quantity behavior beyond what is needed for the safe-integer price invariant.

### Cart drawer accessibility

Use the native modal dialog behavior so focus is contained while open and Escape closes it. Give the dialog an accessible name, focus its close control on open, and return focus to the control that opened it when closed. Keep existing close-button and backdrop-dismiss behavior synchronized with cart state.

## Acceptance criteria

- The homepage no longer requests the missing `/placeholder-hero.jpg` and has a token-styled neutral placeholder with no product-specific claim.
- The cart page contains no link to `/checkout`; checkout is clearly unavailable and remains out of scope.
- Running the database seed would insert no synthetic owner, products, variants, or silver rate; no database is actually seeded during this work.
- Proposed returns/cancellation policy and unsupported seller disclosures are owner-confirmation placeholders and remain drafts.
- Collection and search cards show a neutral unavailable-price state when there is no approved silver rate; known fixed prices and filtering continue to work.
- Persisted carts reject fractional and unsafe integer prices.
- Cart drawer tests cover modal semantics, Escape, initial focus, focus restoration, and existing close behavior.
- Focused tests, workspace tests, typecheck, lint, production build, and `git diff --check` pass.
- Task 8 documentation is synchronized across `README.md`, `docs/setup.md`, `docs/runbook.md`, the `apps/web`, `packages/db`, and other touched package READMEs, relevant ADRs, and `docs/README.md`. Phase 4 stays in progress until the plan's documentation and acceptance checklist is complete.

## Builder decisions

- Use a token-based CSS placeholder in the existing Hero media frame rather than adding a static artwork asset; this respects the approved neutral direction and the repository's token-only styling constraint.
- Keep search and collection behavior consistent because both use the same catalog product projection and price display.
- Use focused unit/component tests; do not add new tooling or run tests against a live database.
