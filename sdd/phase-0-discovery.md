# Phase 0 — Discovery decision log

Human-readable companion to [state.json](state.json). Newest entries at the bottom of each section.

## 0.1 Business scope — decided
- Full v1 (everything in the brief). India at launch; international built now behind a feature flag.
- 100–500 SKUs now, 500–2,000 in two years; 100–1,000 orders/month.
- Infra budget target under ₹1,000/month (ceiling ₹2,000). Maintained by the owner (developer) with AI agents.
- Not GST-registered yet; proprietorship + GST planned. Launch date flexible.
- Flag: international selling needs IEC, GST LUT and an international-card-enabled gateway first.

## 0.2 Domain, email & brand presence — decided
- `argivasilvers.com` primary, `argivasilvers.in` redirect. Registrar: GoDaddy or BigRock (owner's choice); watch renewal prices.
- DNS on Cloudflare free. Email: Zoho Mail free/Lite with SPF/DKIM/DMARC.
- TODO(owner): trademark search on IP India, class 14.
- Requirement: everything config-driven — no hardcoded URLs, domains or business constants.

## 0.3 Cloud & deployment — decided (owner approved revised plan)
- First proposal (DigitalOcean App Platform, ~₹500–1,500/month) was replaced at the owner's request with a free-when-idle setup:
  - Google Cloud Run, Mumbai (`asia-south1`), scale-to-zero, Docker image.
  - Neon Postgres free (autosuspend), Cloudflare R2 media, Cloudflare free DNS/CDN.
  - Resend, PostHog, Sentry free tiers; cron via GitHub Actions / Cloud Scheduler; no Redis.
  - Staging = second Cloud Run service + Neon branch. Production on release tag.
  - Backups: provider + weekly `pg_dump` to R2. Budget alert at ₹500.
- Trade-offs: 1–3 s cold start after idle; Google Cloud needs a card on file.
- Portability: Docker image, plain Postgres and the S3 API all move to AWS/Azure/Kubernetes without rewrites.

## 0.4 Tech stack — decided (bundle A)
- TypeScript modular monolith; pnpm + Turborepo; Next.js standalone Docker (storefront + `/admin`).
- PostgreSQL + Drizzle; Better Auth + custom permission matrix; Zod.
- Razorpay (domestic + international) behind a `PaymentProvider` interface; PayPal later.
- Currency: show converted prices (daily cached FX), always charge INR. Revisit if international > ~20% of sales. *(Owner confirmed.)*

## 0.5 Product catalog & imagery — decided
- Variant axes: length (anklet/chain), ring size, bangle/bracelet size, weight, purity (92.5/80/60), finish (plain/oxidised/rose-gold).
- Purity, finish, weight and price belong to the **variant**; composition labelling and pricing mode are evaluated per variant.
- Product card: price, purity badge, weight, finish.
- Price display: single price, no breakdown. "Inclusive of GST" wording is config-driven and appears only once GST-registered.
- Photography: studio, on-model, lifestyle, short video, scale reference; phone photos now, professional later (image pipeline must handle mixed quality).
- v1 extras: wishlist, reviews & ratings, size guide. Not in v1: gift wrap, engraving, made-to-order, HUID image, bulk import.
- Anklets always sold as a pair. Media: 1–5 images per product, video optional.
- Reviews: anyone can submit, admin approves before publishing. Spam controls: email verification, rate limit, bot protection.

## 0.6 Admin dashboard & RBAC — decided
- 4–10 admin users (owner, family, staff), on mobile and desktop equally.
- Roles: Owner, Manager, Catalog Editor, Fulfilment, Support.
- Silver-rate and price changes: maker-checker (a different Owner/Manager approves). Fallback: Owner may self-approve with a mandatory reason, flagged in the audit log.
- Draft → Publish for products and policy pages.
- 2FA for Owner/Manager; 30-minute idle sign-out; new-device login email; full audit log.
- New-order alerts via browser/phone push and email. WhatsApp Business API alerts deferred (per-message cost). Auto invoices (GST-ready); CSV exports.

### Permission matrix (approved)

V = view, E = create/edit, P = publish/approve, D = delete/deactivate, X = export

| Module | Owner | Manager | Catalog Editor | Fulfilment | Support |
|---|---|---|---|---|---|
| Products, variants, media, categories | VEPD | VEPD | VE (draft only) | V | V |
| Size guide | VEPD | VEPD | VE | — | V |
| Silver rates & prices | VEP | VEP (cannot approve own change) | V | — | V |
| Offers / discounts | VEPD | VEPD | V | — | V |
| Orders | VEX | VEX | V | VE (status, packaging video, invoice, dispatch) | V |
| Damage claims | VEP | VEP | — | V | VE (review notes; Manager approves) |
| Re-polishing requests | VEP | VEP | — | VE | VE |
| Reviews moderation | VPD | VPD | — | — | VPD |
| Customers | VEX | VEX | — | V (shipping details only) | VE |
| Policies & content pages | VEPD | VE (Owner publishes) | VE (draft) | — | V |
| Analytics dashboard | V | V | V (products only) | V (fulfilment only) | V (support only) |
| Users & roles, settings, audit log | VEPD | V (audit log only) | — | — | — |

## 0.7 About, legal & policy pages — decided
- Sole proprietorship; family shop/workshop address; owner is grievance officer. TODO(owner): legal name, address, grievance contact.
- Jurisdiction: Bengaluru courts.
- Cancellation: free before dispatch, none after. Refund to original payment method in 5–7 business days (also for failed/duplicate payments). This is separate from the damage-claim policy, which offers no cash refunds.
- Shipping: aggregator (Shiprocket or Delhivery One) with tracking; flat fee on all domestic orders (amount TODO); dispatch time set per product.
- Pages: T&C, Privacy (DPDP Act 2023), Cookie notice, Shipping, Returns & Damage, Cancellation & Refunds, Care & Re-polishing, Contact with seller/grievance details. All drafts until approved; legal review recommended.
- Our Story: no assets yet → typographic/editorial layout with photo slots for later.
- Published contact: phone, email, WhatsApp chat button and Instagram link (conflict with brief resolved).

## 0.8 Design tooling — decided
- Use: Impeccable (telemetry left on), Anthropic frontend-design skill, Playwright/browser screenshots, shadcn MCP (restyled primitives), theme-factory / brand-guidelines skills.
- Not used: 21st.dev MCP, Figma MCP.
- Install at the start of Phase 1 (todo 0.8a); review Impeccable's editor hooks after install.
- **Installed:** Impeccable (skill, 4 agents, local post-edit detector hook), `frontend-design` and `theme-factory` skills in `.github/skills/`, shadcn MCP in `.vscode/mcp.json`. Browser screenshots use VS Code's built-in tools. Skipped `brand-guidelines` because it applies Anthropic's own brand.

## 0.9 Design direction — in progress
- Moods to explore (one mood page each): quiet luxury, warm Indian craft, modern bold.
- Audience: young women 18–30 (everyday), women 30–50 (occasions/gifting), NRI/international.
- Theme: dark hero and story sections, light shopping pages. English only. No references given.
- Built (Impeccable detect: no findings):
  - A `sdd/design/moods/a-quiet-luxury.html`: oxidised silver + mist + indigo; Marcellus + Hanken Grotesk; hallmark-stamp purity badge.
  - B `sdd/design/moods/b-warm-indian-craft.html`: indigo cloth + khadi + kattha + marigold; Rozha One + Mukta; ghungroo chain divider drawn on load, arched hero photo.
  - C `sdd/design/moods/c-modern-bold.html`: black/white with rose gold as the only accent; Anybody + Atkinson Hyperlegible; poster-scale collection names over a scrolling product rail.
- Decision (2026-10-31): A quiet luxury is the default; B's ghungroo chain appears only on Our Story and the Anklets collection. Pros and cons are in `sdd/design/moods/comparison.md`.
- All three moods kept as switchable themes in `packages/design-tokens` (modelled on linode/design-language-system):
  - Format and build: DTCG tokens, Style Dictionary, CSS variables scoped by `[data-theme]`, plus a typed theme registry.
  - Admin control: the Owner picks among built themes in Admin > Appearance. No raw CSS uploads.
  - Rebrand: `tokens:new` → edit JSON → `tokens:build`. The build validates the token contract and WCAG AA contrast. CI: `.github/workflows/design-tokens.yml`.

## 0.9b PRODUCT.md and DESIGN.md — done (2026-10-31)
- Owner answers: audience is all women, with no single priority group. Accessibility target is WCAG 2.2 AA. The design rulebook's guiding name is "The Silversmith's Ledger".
- `PRODUCT.md` (repo root): users, purpose, positioning, constraints, brand commitments and evidence. Five principles: proof before persuasion, heritage in a quiet voice, phone first, the family can run it, configure don't hard-code.
- `DESIGN.md` (repo root): mirrors the `quiet-luxury` tokens; `packages/design-tokens` stays the source of truth. Named rules: One Accent, Contrast Gate, Ledger Numerals, No-Shadow. Purity badge: solid border for 92.5%, dashed for 80%/60%, never colour alone. Ghungroo divider scoped to Our Story and Anklets.
- `.impeccable/design.json`: sidecar holding motion, breakpoint, component snippets and the rules.
- Verified: Impeccable context loads both files (inherited by `packages/design-tokens`).
- Owner prefers plain-language questions that explain why the answer is needed.

## 0.10 ADRs — done (2026-10-31)
- `docs/adr/` has a README with the template and 12 ADRs: domain/DNS, email, hosting, stack, payments/currency, catalog variants, pricing snapshot, admin RBAC, legal pages, design tooling, design/themes, config-driven. `docs/decisions.md` holds the summary table and the open owner items.
- Technical details the agent proposed (owner to review): money stored as integer paise, a versioned pricing formula, an append-only audit log, idempotent and signature-checked payment webhooks, transactional email sent from a subdomain.
- Owner said "yes proceed" (2026-10-31): treated as accepting these details.

## 0.11 Implementation plan — done (2026-10-31)
- `docs/plans/README.md`: roadmap for Phases 1–8 (what, done-when, owner inputs), dependency diagram, requirement-to-phase map.
- `docs/plans/2026-10-31-phase-1-design-system.md`: 14 test-first tasks — `packages/ui` harness, no-hex guard, formatters and ornament scope, theme context/global CSS/fonts, Button, PurityBadge, Price, ProductCard, Divider, SiteHeader, Hero, ProductHeader, Vite preview app, visual verification and design review.
- Approach proposed for owner confirmation: components in `packages/ui` plus a Vite preview app, since the Next.js app arrives in Phase 2. Commit steps replaced with state checkpoints (agent never commits).
- Detailed plans for later phases are written at the start of each phase.

## 0.12 Phase 0 approval — done (2026-10-31)
- Owner replied "Proceed": Phase 0 approved, with the recommended options accepted (packages/ui + Vite preview; one subagent per task). Phase 1 started.

## Next
- 0.5 Product catalog & imagery → 0.6 Admin RBAC → 0.7 Legal pages → 0.8 Design tooling → 0.9 Design direction → ADRs → plan → approval.
