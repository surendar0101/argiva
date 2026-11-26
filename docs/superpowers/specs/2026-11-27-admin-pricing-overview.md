# Pricing and owner dashboard: agreed requirements and stages

Record of the owner's decisions from the 26–27 November 2026 brainstorm. Each stage gets its own design, approval and plan. Where this differs from earlier decision records, this is newer.

## Pricing

- No built-in silver formula. The owner enters every rate and charge.
- Each product is **piece rate** (default; the owner types the price; silver rate never applies; typically small items such as toe rings and finger rings) or **calculator** (typically bigger items).
- Calculator: weight × the rate of a silver category, plus the owner's own charge lines (fixed rupees, rupees per gram, or percent of silver value or of the lines above). Design cost is a charge line set per product, changeable on a piece.
- A **silver category** (for example "Hand-made 92.5") holds a rate per gram, purity, finish and default charge lines. Products inherit them and may change any line.
- The suggested price is rounded by an owner-set rule (nearest 1, 10 or 50 rupees; nearest or up; default nearest rupee). The owner may type over it.
- Typed and calculated prices are **before GST**. GST is one setting applied last, never a charge line; the final amount follows the rounding rule. It is off until the business is registered. The rate is configurable; 3% for silver jewellery was checked only against secondary web sources, so confirm with an accountant. Switching it on goes through review and publish.
- Customers see saved prices only. Nothing changes until published. A rate change produces one old-and-new list; hand-set prices are flagged and unticked.
- Piece-rate prices can be filtered, selected and adjusted by rupees or percent, or typed in a table, then published.
- Offer price per product, size or piece, with optional start and end dates that apply automatically; old price struck through. Coupons later.
- Each product chooses what customers see (price; optionally weight, per pair, ticked breakdown lines). The breakdown is hidden for hand-set or offer prices.
- A missing rate or weight keeps the last published price; a never-priced item shows "Price unavailable".
- Saved carts show the new price with a notice. Placed orders never change.
- Owner changes publish directly; Manager changes wait for the Owner. Everything is kept in history.
- Pricing is a separate, configurable, documented module.

## Products and stock

- Owner-managed size lists, occasions and styles. A filter appears only when used.
- Up to 5 photos per design, uploaded from the dashboard (phone friendly), resized, stored in Cloudflare R2. Photos per piece are optional.
- Draft until name, SKU, category, photo, price, stock, silver composition, description and care instructions are filled.
- Product is **by piece** (each piece has weight, code and price; customers pick the exact one; piece-rate pieces copy the size price; calculator pieces are priced from their own weight) or **by count** (one price per size and a quantity).
- Codes are generated; the product code is editable. Several pieces can be added at once by weight.
- Cards show "From ₹…" for by-piece items. A piece can be in a cart once; it is held only at checkout. Sold pieces leave the shop but stay in records.
- Piece-rate weight is optional and shown only when ticked.
- Online stock is separate from the offline shop. Sold-out sizes stay visible with an enquiry link. Low-stock warnings appear in the dashboard only.

## Dashboard and sign-in

- Roles in the first version: Owner, Manager, Catalog Editor. Editors add products, pieces and stock but not prices.
- Invited emails only. Password and Google first; email sign-up and reset emails once a domain and email service exist (neither does today).
- Authenticator code for Owner and Manager on every sign-in method, with backup codes.
- Plain English.
- Screens chosen from mockups: side menu (bottom bar on phones) with a home showing checklist, approvals, low stock and drafts; three-step rate change; step-by-step product entry; a separate practice area; a first-time guide per role.

## Stages

| Stage | Delivers | Owner provides |
| --- | --- | --- |
| 1 | Pricing module, sign-in and roles, silver categories and charges, approvals, playground, first guide | Google sign-in credentials (optional at first) |
| 2 | Products, sizes, pieces, stock, photos, price approval, full getting-started guide | Cloudflare R2 account |
| 3 | Rate-change review and publish, bulk changes, offers, history | — |
| 4 | Shop: picking a piece, price display, filters, homepage sections, cart notices; old pricing code removed | Product details and photos |

The shop must keep working after every stage. Do not launch before stage 4.
