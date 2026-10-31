# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

TypeScript modular monolith (pnpm workspaces + Turborepo). Next.js with standalone Docker output serves the storefront and `/admin` from one app. PostgreSQL + Drizzle, Better Auth with a custom role/permission matrix, Zod. Razorpay behind a `PaymentProvider` interface. Hosted on Google Cloud Run (asia-south1) with Neon Postgres, Cloudflare R2/DNS/CDN, Resend, PostHog and Sentry. Design tokens live in `packages/design-tokens`. Full decision record: [sdd/state.json](sdd/state.json).

## Users

- **Shoppers:** women of all ages. No single age group has priority (owner decision). Known segments: young women buying everyday silver, women buying for occasions, family and gifting, and NRI / international customers. Most visits are expected on phones, often arriving from Instagram.
- **Admin staff:** the owner, family members and a few staff (4–10 people) with roles Owner, Manager, Catalog Editor, Fulfilment and Support. They use phones and desktops equally to manage products, prices, stock and orders.

## Product Purpose

ARGIVA Silvers takes a third-generation family silver jewellery business online. Mission (from [docs/brand-content.md](docs/brand-content.md)): make thoughtfully crafted jewellery accessible to modern customers through a convenient, transparent and trusted shopping experience. Success means customers buy with confidence because they understand exactly what they are buying, and the family can run the shop themselves at low cost.

## Positioning

A family business with three generations of silver work, rooted in anklet-making, that states each piece's real silver composition (92.5%, 80% or 60%) instead of blurring it. Tagline: **Modern Silver. Timeless Stories.**

## Operating Context

- Customers browse collections (Chains & Pendants, Earrings, Bangles & Bracelets, Anklets — Our Heritage Collection, Rings, Silver Gifting), compare purity, finish, weight and price, then pay online or ask questions on WhatsApp.
- No cash on delivery. Prices are charged in INR. Anklets are always sold as a pair.
- Every order's packaging is filmed and the video is shared with the invoice. Damage claims need an opening video within 2 days.
- Some prices follow a manually updated silver rate. The final price and all pricing inputs are stored with each order.
- Price and silver-rate changes need approval from a second Owner or Manager.

## Capabilities and Constraints

- India delivery at launch. International selling is built but stays behind a feature flag until GST, IEC, LUT and an international payment gateway are approved.
- 100–500 SKUs now, 500–2000 within two years. 100–1000 orders a month.
- Infrastructure budget: target ₹1000 a month, ceiling ₹2000. Must cost close to nothing when idle.
- Config-driven: no hard-coded domains, URLs or business constants.
- Three visual themes ship. The Owner switches between them in Admin > Appearance. Admins can never upload raw CSS.
- English only.
- Not in v1: gift wrap, engraving, pre-order, hallmark/HUID images, bulk CSV import.
- **Undecided (`TODO(owner)`):** legal name, address, grievance officer, flat shipping fee, shipping aggregator, silver-rate pricing formula, payment gateway account status, trademark search.

## Brand Commitments

- All copy comes from [docs/brand-content.md](docs/brand-content.md), used verbatim.
- Voice: warm, honest, family-first; modern without hype.
- Composition rules: call an item "925 sterling silver" only when that is verified. For 80% and 60% items, state the silver content and explain the remainder. For rose-gold finish, name the underlying metal; never imply solid rose gold.
- Never invent policies, prices, certifications, legal details or contact details.
- Instagram: [@argiva_silvers](https://www.instagram.com/argiva_silvers/).

## Evidence on Hand

- Brand copy, policies (some marked *proposed*) and FAQ: [docs/brand-content.md](docs/brand-content.md).
- No product photography yet. Phone photos come first, professional photos later. Use placeholders until then. Never use the third-party retailer images from the original brief.
- No photos for the Our Story page yet. It uses a type-led layout with slots for photos later.
- No testimonials, reviews, press, hallmark certificates or sales figures exist. Do not fabricate any.

## Product Principles

1. **Proof before persuasion.** Purity, finish, weight, price and policies are shown plainly before any sales language.
2. **Heritage in a quiet voice.** The family story and anklet roots set ARGIVA apart. Tell them with restraint, not ornament everywhere.
3. **Phone first, for every woman.** Design for small screens, slow networks and all ages before desktop.
4. **The family can run it.** Admin tasks must be simple, safe (maker-checker, audit log) and cheap to operate.
5. **Configure, don't hard-code.** Brand, theme, prices and policies change without code edits.

## Accessibility & Inclusion

WCAG 2.2 AA (owner decision). The token build enforces AA contrast for every theme. Tap targets are at least 44 px, all controls work by keyboard, and motion respects `prefers-reduced-motion`. Purity must never be shown by colour alone.
