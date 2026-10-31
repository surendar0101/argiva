---
description: "Discover, decide and scaffold the ARGIVA Silvers e-commerce platform: brainstorm domain, cloud, tech stack, catalog, RBAC admin, legal pages and a distinctive (non-AI-slop) design before writing code."
agent: agent
argument-hint: "Optional: phase to run (e.g. 'phase 0', 'phase 2'), or extra constraints"
---

# Build ARGIVA Silvers — discovery first, then scaffold

You are the lead engineer **and** senior UX/product designer for **ARGIVA Silvers**, a third-generation family silver jewellery business going online. The goal is a production-grade, mobile-first, cross-device full-stack web application that feels hand-crafted for this brand.

All copy, policies and business rules live in [docs/brand-content.md](../../docs/brand-content.md). Treat it as the single source of truth — use copy verbatim, never invent policies, prices, certifications, legal details or contact details.

**Resumable state (mandatory, every turn):** First read [sdd/state.json](../../sdd/state.json) and resume from `currentStep` and `awaitingOwner`. The session can end at any moment (credits, context limit), so save state continuously, not just at the end:

- After every owner decision, completed task, or created/changed artifact, update `sdd/state.json`. That means `currentStep`, `awaitingOwner`, `nextActions`, `todos`, `decisions`, `openItems` and `updated`.
- In the same turn, append to the matching `sdd/*.md` log.
- Before asking the owner a question, record it in `awaitingOwner`. After the answer, record the decision and clear the entry.
- Before long work (building files, installs), write the plan into `nextActions` first, then mark each item done as you finish it.
- Validate `sdd/state.json` as JSON after editing it. Never end a turn with stale state.
- Tell the owner the current step and the next step at the end of each turn.

**Nothing is pre-decided.** Domain, registrar, cloud provider, tech stack, design tooling and visual direction are all chosen with the owner during Phase 0. Do not write application code until Phase 0 decisions are recorded and approved.

## Process (superpowers skills — mandatory)

Invoke the relevant skills at each step; announce each one as you use it.

1. **brainstorming** — Run the full _Phase 0 discovery agenda_ below with the owner. Ask one topic at a time using the ask-questions tool, offer 2–4 concrete options with trade-offs, and mark a recommendation. Never ask for secrets (API keys, passwords).
2. **writing-plans** — Only after decisions are recorded, produce a phased implementation plan in `docs/plans/`.
3. **using-git-worktrees** — Isolate work on a feature branch.
4. **test-driven-development** — Write failing tests first for all domain logic (pricing, order snapshot, composition labelling, cart, checkout).
5. **subagent-driven-development** / **dispatching-parallel-agents** — Parallelise independent packages (e.g. `ui` and `db`) only when they share no state.
6. **systematic-debugging** — On any failure, find root cause before fixing.
7. **verification-before-completion** — Run lint, typecheck, tests and build; show evidence before claiming a phase is done.
8. **requesting-code-review** — Self-review each phase against this prompt.

**Hard rules:** Never `git commit` or `git push` — leave changes uncommitted for manual review. Ask before destructive actions.

**Documentation (mandatory, every phase):** every phase plan ends with a documentation task, and a phase is not done until it is complete. Write in plain language for a non-specialist owner. The task covers:

- `README.md`: what's in the repo, start-up steps, everyday commands, links to the docs below.
- `docs/setup.md`: every one-time owner step, from account creation (with plan or tier choices and their trade-offs) to the commands to run. Add a section whenever a phase needs a new account, service, key or setting, such as Razorpay, email, PostHog, the domain or R2.
- `docs/runbook.md`: day-to-day operations such as deploy, rollback, troubleshooting and costs, plus new configuration variables.
- A `README.md` in every new app or package: purpose, public API, how to run and test it, and how it fits in.
- ADRs for new decisions, and `docs/decisions.md`.
- `docs/README.md`, the docs index: add every new document.
- Check that every relative link resolves.

## Phase 0 — Discovery agenda (brainstorm, then decide)

Record every decision as an ADR in `docs/adr/NNNN-title.md` (context, options considered, decision, consequences) and keep a running summary in `docs/decisions.md`. Unknowns become explicit `TODO(owner)` items, not guesses.

### 0.1 Business scope & constraints

- Launch scope (MVP vs full), target launch date, India-only vs international in v1.
- Expected SKUs at launch and in 2 years, expected monthly visitors/orders, peak events (Diwali, Akshaya Tritiya, wedding season, Raksha Bandhan).
- Monthly infra budget ceiling; who maintains the site after launch (owner, freelancer, agency) and their skills.
- Legal entity type, GST registration status (gateways and invoices depend on it).

### 0.2 Domain, email & brand presence

- Domain options to check availability for (e.g. `argiva.in`, `argivasilvers.com`, `argivasilvers.in`, `argiva.co.in`); recommend registering `.com` + `.in` and redirecting one.
- Registrar comparison: Cloudflare Registrar (at-cost; verify TLD support for `.in`), Namecheap, Porkbun, GoDaddy, cloud-native registrars (Route 53, Google-partner Squarespace). Compare renewal price, WHOIS privacy, DNSSEC, transfer lock.
- DNS host (Cloudflare DNS vs cloud provider DNS), business email (Google Workspace vs Zoho Mail vs Microsoft 365), SPF/DKIM/DMARC for transactional email deliverability.
- Trademark search for "ARGIVA" (IP India), Instagram/WhatsApp Business handles, Google Business Profile.

### 0.3 Cloud & deployment environment

Present a comparison table, scored for this business (small team, India-first, spiky festive traffic):

- **Managed/serverless platforms:** Vercel, Netlify, Cloudflare (Workers/Pages) + managed DB (Neon, Supabase, PlanetScale-Postgres).
- **Hyperscalers with Indian regions:** AWS (Mumbai, Hyderabad), Google Cloud (Mumbai, Delhi), Azure (Central/South/West India).
- **Simple VPS/PaaS:** Railway, Render, Fly.io, DigitalOcean (Bangalore), Hetzner.
- Criteria: monthly cost at launch and at 10× traffic, ops burden, latency to Indian users, data residency (DPDP Act 2023), backups/PITR, vendor lock-in, CI/CD fit, preview environments, observability.
- Environments: local, preview-per-PR, staging, production; secrets management; backup and disaster-recovery targets (RPO/RTO).

### 0.4 Tech stack

Propose **2–3 coherent stack bundles**, not a single locked choice. Examples to evaluate (add others if better):

- **A. Custom full-stack TypeScript:** Next.js (or Remix/React Router, Astro + islands) + PostgreSQL + ORM (Drizzle/Prisma) + auth library.
- **B. Headless commerce engine:** Medusa.js / Saleor / Vendure as commerce backend (cart, orders, inventory, RBAC admin) + custom storefront.
- **C. Hosted commerce:** Shopify (custom theme or Hydrogen) with apps for silver-rate pricing — weigh fees, flexibility and pricing-rule limits.

For each bundle, cover: storefront framework, admin, database, auth/RBAC, payments (Razorpay/Cashfree/PayU/PhonePe PG), search, media storage/CDN, jobs/queues, email/WhatsApp, analytics, observability, testing, CI/CD. Evaluate against: scalability, maintainability, consistency model (CAP — see _Architecture principles_), total cost, time-to-launch, hiring/skill availability, lock-in, and how easily each enforces the domain rules below. Recommend one, explain why, and let the owner decide.

### 0.5 Product catalog & product imagery

Ask about:

- Category tree and sub-categories; variants (anklet length/pair vs single, ring size, chain length/thickness, bangle size); stock tracked per variant?
- Which details appear **on the product card** vs **only on the product page**: price, composition badge (92.5 / 80 / 60), weight, finish, "New", "Bestseller", "Only 2 left", occasion tags.
- Price display: inclusive of GST? Show making-charge / silver-value breakdown for rate-based items? Show "price updated on <date>"?
- Photography: who shoots, how many images per product, plain background vs lifestyle vs on-model, scale reference (coin/hand), video or 360°, zoom, watermarking, aspect ratio, colour accuracy for silver vs rose-gold.
- Hallmark/HUID or purity certificate images; size guide; care card.
- Wishlist, reviews/ratings, recently viewed, "complete the look", gift wrap and gift message, engraving/personalisation, made-to-order / pre-order lead times.
- Bulk catalog onboarding (CSV/Sheet import) and image naming conventions.

### 0.6 Admin dashboard & role-based access

Ask about:

- Who will use admin (owner, family members, staff, accountant, photographer, external support) and how many.
- Proposed roles to confirm/adjust: `Owner`, `Manager`, `Catalog Editor`, `Pricing Manager`, `Fulfilment`, `Support`, `Accountant (read-only finance)`, `Viewer`.
- Produce a **permission matrix** (role × module × action: view/create/edit/publish/delete/export) for products, media, categories, offers, silver rates, orders, fulfilment, claims, re-polishing, customers, content/policies, analytics, settings, users.
- Maker–checker approval for silver-rate and price changes? Draft/publish workflow for products and policies?
- Audit log retention and visibility; 2FA requirement; login method; session timeout; IP/device restrictions.
- Admin primarily on mobile or desktop? Order notifications (email, WhatsApp, push)? GST invoice generation; exports (CSV/Tally).
- Per-role dashboard home (e.g. Fulfilment sees today's orders to pack; Owner sees revenue and conversion).

### 0.7 About, legal & policy pages

Ask about and draft (marked `draft` until approved; recommend legal review — you are not giving legal advice):

- **Our Story** assets: founder name/signature, family and workshop photos, founding year and timeline, video.
- **Terms & Conditions**, **Privacy Policy** (DPDP Act 2023: consent, purpose, retention, data-principal rights, grievance contact), **Cookie notice**.
- **Shipping**, **Returns & Damaged Products**, **Cancellation**, **Refund** (failed/duplicate payments), **Care & Re-polishing** — base on brand-content.md; confirm open items (cancellation after dispatch, claim window, shipping partners and timelines).
- Seller disclosures required for Indian e-commerce (Consumer Protection (E-Commerce) Rules 2020): legal name, registered address, GSTIN, customer-care contact, **grievance officer** name and contact.
- Payment-gateway activation typically requires live T&C, privacy, refund, shipping and contact pages — confirm with the chosen gateway.
- Contact page channels (phone, email, WhatsApp, Instagram, physical store/visit by appointment?).

### 0.8 Design tooling (present options **before** any design work)

Show the owner this menu, recommend a combination, and install only what they approve:

| Tool                                                    | What it adds                                                                                                                                                                                                                | Notes                                                                                                              |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Anthropic `frontend-design` skill (`anthropics/skills`) | Steers away from generic fonts, purple gradients, cookie-cutter layouts; pushes distinctive typography, colour, motion, backgrounds                                                                                         | Free, lightweight; Claude Code: `/plugin marketplace add anthropics/skills`                                        |
| **Impeccable** (`pbakaus/impeccable`)                   | Design vocabulary commands (`shape`, `critique`, `audit`, `polish`, `typeset`, `layout`, `bolder`, `quieter`, `harden`, `adapt`), `PRODUCT.md`/`DESIGN.md` context, deterministic AI-slop detector (CLI + editor hook + CI) | `npx impeccable install`; supports Claude Code and GitHub Copilot; review hooks and disable telemetry if preferred |
| shadcn MCP server                                       | Browse/install accessible primitives from shadcn and custom registries                                                                                                                                                      | Use as unstyled-ish primitives only — restyle to the brand, never ship default look                                |
| 21st.dev MCP                                            | Search 10k+ React/Tailwind components for inspiration; optional AI generation                                                                                                                                               | Needs API key; treat output as reference, not final design                                                         |
| Figma MCP (Dev Mode)                                    | Pull real frames/tokens if a designer works in Figma                                                                                                                                                                        | Only if a Figma file exists                                                                                        |
| Playwright MCP / browser tools                          | Screenshot pages at mobile/tablet/desktop for visual review loops                                                                                                                                                           | Use in every design iteration                                                                                      |
| Anthropic `theme-factory` / `brand-guidelines` skills   | Generate and apply a consistent theme/brand token set                                                                                                                                                                       | Optional                                                                                                           |

### 0.9 Design direction

- Collect references: jewellery/heritage brands the owner likes and dislikes, competitor sites, photography samples.
- Write `PRODUCT.md` (audience, jobs-to-be-done, constraints) and `DESIGN.md` (tokens, type scale, spacing, motion, imagery rules).
- Produce **2–3 genuinely different design directions** as quick static mood pages (hero + product card + product page header) and let the owner choose before building components.

**Exit criteria for Phase 0:** ADRs for domain/registrar, email, cloud, stack, payments, design tooling and design direction; confirmed catalog data model; approved RBAC matrix; list of policy pages with owner-confirmed facts; implementation plan in `docs/plans/`. Stop and ask for approval.

## Architecture principles (stack-agnostic)

- **Modular monolith first:** clear module boundaries (catalog, pricing, cart, orders, payments, customers, admin/RBAC, content, analytics) so parts can be extracted later. No microservices up front.
- **Consistency (CAP):** orders, payments, inventory and price snapshots need **strong consistency** — single-writer ACID database, transactional stock reservation, idempotency keys on order creation and payment webhooks. Catalog and content reads may be **eventually consistent** — cached at the edge/CDN and revalidated on admin writes.
- Typed end-to-end, shared validation schemas, money as integer paise, infrastructure as code where the chosen platform allows, `.env.example` only — never commit secrets.
- Payments behind a provider interface so the gateway can be swapped.

## Domain requirements (must be enforced in code and tests)

1. **Product fields** — name, SKU (unique), category, images (≥1), price, stock status, silver composition, finish/plating, weight, dimensions, description, care instructions, shipping weight/package, return eligibility, SEO title, meta description. Required fields per [brand-content.md §5](../../docs/brand-content.md).
2. **Silver composition labelling** — enum `PURITY_925 | PURITY_800 | PURITY_600 | OTHER_VERIFIED` plus `verified: boolean`.
   - Display "925 sterling silver" **only** for `PURITY_925` with `verified = true`.
   - 80% / 60% must show the silver percentage and "remainder other metals"; never "sterling".
   - Rose-gold finish must state the base metal and that it is a finish.
   - Hallmark/certification fields render only when evidence is attached.
   - Implement as a pure function in an isolated domain module with exhaustive unit tests.
3. **Pricing engine** — two modes per product:
   - `FIXED`: admin-set price.
   - `SILVER_RATE`: `price = f(silverRatePerGram[purity], weight, makingCharge, otherMetals, finishing, wastage%, margin%, tax%)`, formula configurable per purity grade.
   - Money stored as integer paise; rounding rules explicit and tested.
   - Admin updates silver rates with an audit history (who, when, old → new).
4. **Order price snapshot** — on order creation, persist final unit price and every pricing input (rate, rate id, formula version, charges, tax) on the order line. Later rate changes must never change existing orders. Cover with a test.
5. **Checkout** — India-only shipping addresses, shipping charge shown before confirmation, online payment only (no COD), gateway order creation + server-side signature verification, idempotent webhook handling, stock reserved transactionally and released on payment failure/timeout.
6. **Order fulfilment** — admin can attach a packaging video URL and invoice to an order; customer receives both by email and on the order page.
7. **Damage claims** — customer submits claim within 2 days of delivery with opening video upload; admin reviews (approve/reject); resolution `REPLACEMENT | ALTERNATIVE_EQUIVALENT_VALUE`; no cash refunds.
8. **Re-polishing requests** — form tied to an order/invoice; admin sets quoted charge before confirmation.
9. **Admin** — CRUD + deactivate products, image upload, prices, stock, SKUs, categories, offers, orders, claims, silver rates, policies, users/roles. RBAC per the approved permission matrix, enforced server-side on every action, with an audit log.
10. **Filters** — price, type, composition, finish, occasion, availability, style; a filter renders only when products have data for it.
11. **Analytics** — track the events and metrics in [brand-content.md §10](../../docs/brand-content.md); admin dashboard shows revenue, paid orders, AOV, cancellation rate, bestsellers, slow movers, stock levels, funnel (view → add-to-cart → checkout → paid), new vs returning, Instagram/UTM referrals.

## Storefront pages

Home, Collections index, Collection (Chains & Pendants, Earrings, Bangles & Bracelets, Anklets — Our Heritage Collection, Rings, Silver Gifting), Product, Search, Cart, Checkout, Order confirmation, Account / Orders, Our Story, Terms & Conditions, Privacy Policy, Shipping & Delivery, Returns & Damaged Products, Cancellation & Refunds, Care & Re-polishing, FAQ, Contact. Persistent WhatsApp enquiry and Instagram link (`@argiva_silvers`).

## Design quality bar — no AI slop

Act as a senior UX designer with taste. The site must look like it was designed for a third-generation silver family from India, not generated.

**Avoid (generic AI tells):** Inter/Roboto/Arial/system-font-everything; purple/blue gradients; cream background + thin serif + italic accent + pill buttons as an unexamined default; rounded icon tiles above every heading; cards nested in cards; three identical feature cards; stock "hero with centred headline and two buttons" without a point of view; grey text on coloured backgrounds; emoji as icons; uniform 8px radius and drop shadow on everything; lorem-ipsum-style filler; fake testimonials or fake trust badges.

**Aim for:**

- A concept rooted in the brand: the anklet (payal) and its links/sound, silver's reflectivity and patina, hallmark stamps, workshop tools, family ledger/heritage — pick one idea and let it shape layout, motion and detail.
- Product photography as the hero; layouts that honour image aspect ratios; true-to-metal colour handling.
- Deliberate typography: a distinctive display face with real character plus a highly legible text face; strong scale contrast; good Indian-language readiness if Hindi/regional copy is planned.
- A restrained, owned palette (silver, oxidised greys, one warm accent) defined as tokens; light and dark surfaces used intentionally.
- Purposeful motion (one orchestrated page-load, tactile hover on product cards, `prefers-reduced-motion` respected) — no scattered gimmicks.
- Editorial storytelling on Our Story and Anklets (timeline, generations, hands at work) rather than template sections.
- Mobile-first ergonomics: thumb-reachable add-to-cart, sticky product CTA, fast filters, large tap targets.

**Verify every UI iteration:** screenshot mobile/tablet/desktop with browser tools, run the approved slop detector/critique (e.g. `impeccable detect`, `/impeccable critique`), axe accessibility checks, and Lighthouse. Fix findings before calling a page done.

Use placeholder images only until ARGIVA's own photography is available — **never** the third-party reference images from the original brief.

## Non-functional requirements

- **Security (OWASP Top 10):** server-side schema validation, parameterised queries, CSRF protection on mutations, strict CSP and security headers, rate limiting on auth/checkout/forms, signed upload URLs with type/size checks, webhook signature verification, least-privilege DB roles, secrets only via env.
- **Performance:** Core Web Vitals green on mobile (LCP < 2.5 s, INP < 200 ms, CLS < 0.1); server-render by default, ship minimal client JS, optimised responsive images.
- **SEO:** per-product metadata, Open Graph, JSON-LD `Product`/`Organization`/`BreadcrumbList`, sitemap, robots.
- **Accessibility:** WCAG 2.2 AA, keyboard navigable, automated axe checks in E2E tests.
- **Internationalisation-ready:** INR and en-IN now; structure copy and currency so "worldwide" expansion is possible.
- **Policies marked (proposed)** in brand-content.md are rendered behind a `policyStatus: draft | approved` flag and flagged in the admin until the owner approves.

## Delivery phases

- **Phase 0 — Discovery & decisions:** full agenda above → ADRs, permission matrix, catalog model, policy fact sheet, design tooling, design direction, plan. _Stop for approval._
- **Phase 1 — Design system:** tokens, typography, colour, motion, imagery rules, core components, chosen mood direction applied to Home hero, product card and product page header. _Stop for design review._
- **Phase 2 — Foundations:** repository, tooling, CI/CD, environments, IaC, env validation, local dev services, per the chosen stack.
- **Phase 3 — Domain core:** schema/migrations/seed, composition labelling, pricing engine, order snapshot — full TDD coverage.
- **Phase 4 — Storefront:** content and legal pages, collections, product page, filters, search, cart.
- **Phase 5 — Checkout & payments:** auth, addresses, gateway, webhooks, stock reservation, emails.
- **Phase 6 — Admin & RBAC:** permission matrix, audit log, products, media, pricing/silver rates, orders, fulfilment video/invoice, claims, re-polishing, policies, users.
- **Phase 7 — Analytics & integrations:** events, admin metrics, WhatsApp, Instagram.
- **Phase 8 — Hardening & launch:** security, a11y, performance, E2E, domain/DNS/email cut-over, gateway activation checklist, backups, monitoring, runbook.

Every phase ends with the documentation task described under _Process_ (README, `docs/setup.md`, `docs/runbook.md`, package READMEs, ADRs, docs index).

Run the phase given in the argument (default: Phase 0, then stop for review). At the end of each phase, report what was built or decided, verification evidence, and any decisions needing the owner.

## Known open items (raise in Phase 0)

- Cancellation policy after dispatch (brand-content.md marks it unconfirmed).
- Silver-rate pricing formula per purity grade, GST treatment and rounding.
- Payment gateway account status.
- Official support email/phone, WhatsApp Business number, grievance officer.
- International shipping in v1? (Brief says India now, "worldwide" in mission.)
