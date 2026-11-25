# Phase 4 Storefront Design Specification

## Overview & Intent
Build the responsive, mobile-first customer storefront for ARGIVA Silvers in [apps/web/](apps/web/), connecting pure domain logic from [packages/domain/](packages/domain/), schema and seed queries from [packages/db/](packages/db/), accessible design tokens from [packages/design-tokens/](packages/design-tokens/), and shared UI components from [packages/ui/](packages/ui/).

The storefront implements **Option A (Balanced Approach)** approved by the owner:
1. **Quiet luxury aesthetics:** Editorial typography (Marcellus display, Hanken Grotesk text), restrained palette, and purposeful motion.
2. **The Silversmith's Ledger transparency:** Verified composition badges, exact weight in grams, metal finish, and transparent pricing displayed clearly on every product card and header.
3. **Mobile-first ergonomics:** Thumb-friendly navigation, quick-browse collection rails, sticky "Add to Cart" triggers, slide-over cart drawer, and WhatsApp direct assistance.

---

## Scope & Pages

### 1. Global Navigation & Layout
- **Site Header:** Sticky brand header featuring wordmark, collection navigation dropdown/drawer on mobile, search trigger, and interactive cart button displaying live item count.
- **Site Footer:** Brand positioning, three-generation heritage note, WhatsApp click-to-chat, Instagram link, quick links to collections, legal/policy links, and consumer protection seller disclosures.
- **Theme support:** Sets theme data attributes (`data-theme`) on the root document based on configured default theme with support for runtime switching.

### 2. Homepage (`/`)
- **Hero Section:** Responsive banner with high-contrast imagery, Marcellus display headline, tagline, and direct CTAs to "Explore Collections" and "Discover Our Story".
- **Shop by Collection:** Grid and mobile snap-scroll rail covering all 6 brand categories (Chains & Pendants, Earrings, Bangles & Bracelets, Anklets — Our Heritage Collection, Rings, Silver Gifting).
- **Heritage Feature ("A Legacy That Deserves to Shine"):** Rich editorial section highlighting the family's anklet-making roots and craftsmanship.
- **The ARGIVA Promise:** Grid of trust pillars (Rooted in Legacy, Made for Modern Living, Clear Product Information, Personal Shopping Experience).
- **Social & Contact Banner:** Direct links to Instagram (`@argiva_silvers`) and WhatsApp support.

### 3. Collection Pages (`/collections` and `/collections/[slug]`)
- **Category Index (`/collections`):** Overview of all collections with category descriptions from [docs/brand-content.md](docs/brand-content.md).
- **Collection Detail (`/collections/[slug]`):**
  - Collection title, description, and breadcrumbs.
  - Active filter bar: Dynamic filters for purity grade, finish, and price range. Filters only render when matching product data exists.
  - Product grid: Responsive 2-column on mobile, 3/4-column on desktop using [packages/ui/src/components/ProductCard/ProductCard.tsx](packages/ui/src/components/ProductCard/ProductCard.tsx).
  - Empty state with filter reset action.

### 4. Product Detail Page (`/products/[slug]`)
- **Media Gallery:** Main image viewer with thumbnail selector and touch swipe support.
- **Product Header & Facts:** Name, price (using `formatInr`), exact weight in grams (`formatWeight`), finish, and verified purity badge.
- **Variant Selector:** Interactive selection for size, weight, purity, and finish when multiple variants exist.
- **Domain Calculations:** Price dynamically computed via `calculateVariantPrice` from [packages/domain/](packages/domain/) using active silver rates where applicable.
- **Product Story & Care:** Full product description, care instructions, and return eligibility notices.
- **Mobile Sticky CTA:** Fixed bottom bar on mobile viewports for effortless "Add to Cart".
- **Packaging Video Notice:** Highlighting ARGIVA's transparent parcel packing video guarantee.

### 5. Cart Management & Drawer (`/cart` & Global Slide-over)
- **Cart State:** Client-side cart provider backed by persistent local storage / cookies.
- **Line Items:** Variant image, product name, selected specifications, unit price, quantity increment/decrement, and item removal.
- **Order Summary:** Subtotal in paise, tax breakdown note, and shipping fee calculation preview.
- **Checkout Action:** Clear CTA button pointing to Phase 5 checkout flow.

### 6. Editorial & Policy Pages
- **Our Story (`/our-story`):** Complete brand story narrative following [docs/brand-content.md](docs/brand-content.md) §3.
- **FAQ (`/faq`):** All 11 brand questions and answers covering purity, rose-gold finishes, shipping, returns, and care.
- **Contact (`/contact`):** Phone, email, WhatsApp button, Instagram, and statutory grievance officer disclosure placeholders.
- **Legal & Policy Pages (`/policies/[slug]`):**
  - Terms & Conditions, Privacy Policy (DPDP Act 2023), Shipping & Delivery, Returns & Damaged Products, Cancellation & Refunds, Care & Re-polishing, and Cookie Notice.
  - Displayed with a clear "Draft Policy — Pending Owner Sign-off" banner per ADR 0009.

### 7. Search & Discovery (`/search`)
- Live client-side or server query search filtering by title, description, category, and SKU.

### 8. SEO & Structured Data
- Automated `sitemap.xml` and `robots.txt`.
- Dynamic OpenGraph tags, title templates, and meta descriptions.
- JSON-LD Structured Data: `Product`, `Organization`, and `BreadcrumbList`.

---

## Technical Constraints & Standards
1. **Next.js 16 App Router:** Server Components by default; Client Components (`'use client'`) only for interactive controls (cart, variant picker, image gallery, drawer).
2. **Zero Hardcoded Styles:** All colors, spacing, and typography must use `--argiva-*` CSS custom properties from [packages/design-tokens/](packages/design-tokens/). No raw hex codes.
3. **No Hardcoded Business Constants:** Centralized configuration from [packages/config/](packages/config/).
4. **Accessible (WCAG 2.2 AA):** Keyboard navigable, appropriate ARIA roles, automated axe tests on key pages.
5. **No git commit or git push:** Code remains unstaged for owner review.
