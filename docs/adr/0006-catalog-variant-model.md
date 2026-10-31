# 0006. Catalog and variant model

- Status: Accepted
- Date: 2026-10-31
- Deciders: Owner (+ agent)

## Context
The same design can be made in different silver compositions (92.5%, 80%, 60%), finishes and sizes. Labelling rules in [docs/brand-content.md](../brand-content.md) §5 forbid calling anything "925 sterling silver" unless it is verified, or implying solid rose gold.

## Options considered
- Purity and finish on the **product** (simpler, but one design in two purities would become two products).
- Purity and finish on the **variant** (more fields, but labelling and pricing are always correct).

## Decision
- Variant axes: length (anklets, chains), ring size, bangle/bracelet size, weight, purity (92.5/80/60), and finish (plain, oxidised, rose-gold).
- **Purity, finish, weight and price live on the variant.** Composition labels and the pricing mode are worked out per variant.
- Product cards show price, purity badge, weight and finish. One price, no breakdown. The "Inclusive of GST" wording comes from config and appears only after GST registration.
- Anklets are always sold as a pair. Each product has 1–5 images, plus an optional video.
- In v1: wishlist, reviews (moderated before publishing; email verification, rate limit, bot protection) and a size guide.
- Not in v1: gift wrap, engraving, pre-order, HUID images, bulk CSV import.

## Consequences
- Filters (purity, finish) query variants, not products.
- The composition label is generated from the variant data, never typed as free text. A "925" label requires a verified flag.
- The image pipeline must cope with mixed-quality phone photos at launch.
