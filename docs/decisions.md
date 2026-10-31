# Decisions summary

Short index of accepted decisions. Details, options and consequences are in [docs/adr/](adr/README.md). The full resumable state is in [sdd/state.json](../sdd/state.json).

| # | Decision | Summary |
|---|---|---|
| [0001](adr/0001-domain-registrar-dns.md) | Domain & DNS | `argivasilvers.com` (+ `.in` redirect), GoDaddy/BigRock, Cloudflare DNS/CDN |
| [0002](adr/0002-email.md) | Email | Zoho Mail mailboxes; Resend for transactional email behind an interface |
| [0003](adr/0003-cloud-hosting.md) | Hosting | Cloud Run asia-south1 (scale-to-zero), Neon, R2, Cloudflare; local / staging / production |
| [0004](adr/0004-tech-stack.md) | Stack | TypeScript modular monolith: Next.js, Postgres + Drizzle, Better Auth, Zod, pnpm + Turborepo |
| [0005](adr/0005-payments-currency.md) | Payments | Razorpay behind `PaymentProvider`; show converted prices, always charge INR; no COD |
| [0006](adr/0006-catalog-variant-model.md) | Catalog | Purity, finish, weight and price on the variant; composition label generated from verified data |
| [0007](adr/0007-pricing-modes-order-snapshot.md) | Pricing | Fixed or silver-rate mode; every order line stores the price and all inputs |
| [0008](adr/0008-admin-rbac-maker-checker.md) | Admin & RBAC | 5 roles, approved matrix, maker-checker on prices, 2FA, audit log |
| [0009](adr/0009-legal-policy-pages.md) | Legal pages | 8 policy pages, drafts until owner approves; Bengaluru jurisdiction |
| [0010](adr/0010-design-tooling.md) | Design tooling | Impeccable, frontend-design, theme-factory, shadcn MCP, browser screenshots |
| [0011](adr/0011-design-direction-themes.md) | Design & themes | Quiet luxury default; 3 switchable token themes; Owner-only switching |
| [0012](adr/0012-config-driven.md) | Config | Typed, Zod-validated config + admin site settings; no hard-coded business values |

## Tooling notes
- TypeScript pinned to 6.0.x because Next.js and typescript-eslint need the TypeScript JavaScript API, which 7.0 lacks; revisit when both support 7.

## Open owner items
Legal name, address and grievance officer contact; flat shipping fee; shipping aggregator; silver-rate formula, GST treatment and rounding; Razorpay account status; support email/phone and WhatsApp number; trademark search.
