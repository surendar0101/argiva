# @argiva/web

The ARGIVA Silvers storefront, built with Next.js 16 and React 19. It reads settings through [`@argiva/config`](../../packages/config/README.md), data through [`@argiva/db`](../../packages/db/README.md), business rules through `@argiva/domain`, and visuals from [`@argiva/ui`](../../packages/ui/README.md). Checkout, payments and the admin dashboard are later phases.

## What it serves

| Path | What it returns |
| --- | --- |
| `/` | Storefront home with active collections, brand story and promise sections |
| `/collections` | Active collections |
| `/collections/[slug]` | A collection with available filters and products |
| `/products/[slug]` | Published product details, variant selection and add-to-cart |
| `/search?q=…` | Search across published products and variants |
| `/cart` | Browser-persisted cart; says online checkout is not available yet |
| `/our-story`, `/faq`, `/contact` | Brand and customer information |
| `/policies/[slug]` | Database-backed policy content with a draft notice when its status is `draft` |
| `/sitemap.xml` | Sitemap generated from active categories, published products and stored policy rows |
| `/robots.txt` | Production indexing rules; non-production environments are disallowed |
| `/api/health` | Liveness check. Always `200` with `{"status":"ok","version":"<APP_VERSION>"}`. |
| `/api/ready` | Readiness check. Runs `select 1` against Postgres. `200` with `{"status":"ok","db":"ok"}` if the database answers within 2 seconds, otherwise `503` with `{"status":"unavailable","db":"down"}`. |

Both API routes send `Cache-Control: no-store`. When the database check fails, the error details are logged on the server only (the error name, not the message), so passwords never reach the response.

The Docker image uses `/api/health` for its health check.

Policy routes only resolve for policy records present in the database. Their seed records are drafts; a draft banner is shown, and legal content must not be treated as owner-approved. No admin publishing interface exists yet. Create the tables and reference data as described in the [runbook](../../docs/runbook.md#storefront-schema-and-content-readiness).

Two rules keep the shop honest:

- A product with no confirmed price (no approved silver rate, or no fixed price) is listed as **Price unavailable**, can't be added to the cart and never matches a price filter.
- A business fact the owner hasn't confirmed shows as **Details coming soon.** (`src/lib/placeholders.ts`).

The cart drawer is a native modal dialog: Escape or the backdrop closes it, and focus returns to where it was.

## How it works

| File | Job |
| --- | --- |
| `src/app/layout.tsx` | Loads fonts and global CSS from `@argiva/ui`, sets the server-rendered theme and site metadata, and includes Organization JSON-LD. |
| `src/app/theme-provider.tsx` | Re-exports `ThemeProvider` from `@argiva/ui` as a client component. |
| `src/app/page.tsx` | The storefront home page. |
| `src/lib/catalog.ts` | Server-side queries for active categories and published products, including search and product details. |
| `src/lib/policies.ts` | Server-side queries for stored policy content and sitemap slugs. |
| `src/lib/seo.ts` | Metadata and JSON-LD builders with safe script serialization. |
| `src/components/cart/cart-context.tsx` | Validated client cart state synchronized to browser local storage through an external-store snapshot; not an order or payment system. |
| `src/app/api/health/route.ts`, `src/app/api/ready/route.ts` | The two endpoints above. |
| `src/server/health.ts` | The `liveness()` and `readiness()` response logic, kept separate so it can be unit-tested. |
| `src/server/db.ts` | One shared Postgres connection pool (`postgres` package, at most 5 connections, 5 s connect timeout) and `pingDatabase()`. |
| `src/instrumentation.ts` + `src/instrumentation-node.ts` | Startup config check. When the Node.js server starts, it calls `getConfig()`. If a setting is missing or invalid, it prints the list of problems and exits with code 1. The site never starts half-configured. |
| `src/security-headers.ts` | Security headers added to every response (see below). |
| `next.config.ts` | `output: 'standalone'` for the Docker image, compiles the `@argiva/ui` and `@argiva/config` source, hides the `X-Powered-By` header, and applies the security headers. |

### Security headers

Every page and API response gets these headers:

| Header | Value |
| --- | --- |
| `Content-Security-Policy` | `frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

## Run it locally

Run every command from the repo root. We run pnpm through npx; the [runbook](../../docs/runbook.md#how-we-run-pnpm) explains why.

1. Install dependencies (once, and again when `pnpm-lock.yaml` changes):

   ```sh
   npx --loglevel=error pnpm@12.16.1 install
   ```

2. Create your settings file. The dev server reads `apps/web/.env.local`, not a root `.env`. Git ignores it.

   ```sh
   cp .env.example apps/web/.env.local
   ```

3. Start the local database:

   ```sh
   docker compose up -d --wait db
   ```

4. [Create the tables and reference data](../../docs/runbook.md#storefront-schema-and-content-readiness).

5. Start the dev server on <http://localhost:3000>:

   ```sh
   npx --loglevel=error pnpm@12.16.1 dev
   ```

To run the production-like Docker build instead, see the [runbook, section 1](../../docs/runbook.md#1-local-development).

## Commands

| What it does | Command |
| --- | --- |
| Dev server (port 3000) | `npx --loglevel=error pnpm@12.16.1 dev` |
| Build | `npx --loglevel=error pnpm@12.16.1 --filter @argiva/web build` |
| Unit tests (vitest, `src/` and `e2e/`) | `npx --loglevel=error pnpm@12.16.1 --filter @argiva/web test` |
| Browser tests ([how](../../docs/runbook.md#browser-tests)) | `npx --loglevel=error pnpm@12.16.1 e2e` |
| Type check (`next typegen` then `tsc`) | `npx --loglevel=error pnpm@12.16.1 --filter @argiva/web typecheck` |
| Lint (whole repo; this app has no own lint script) | `npx --loglevel=error pnpm@12.16.1 lint` |

The web tests cover the storefront routes and interactions, catalog and policy query behavior, SEO output, security headers, and health/readiness responses. They use fixtures/mocks and do not require a running database.

The browser tests in `e2e/` run the production build against throwaway databases: every page and internal link, filters, search, the cart by keyboard, an empty shop and accessibility checks.

## How it fits with other packages

| Depends on | Used for |
| --- | --- |
| `@argiva/config` | Every setting: version, environment, database URL, optional Instagram profile URL, default theme. |
| `@argiva/ui` | Components, `ThemeProvider`, fonts (`@argiva/ui/fonts`) and global CSS (`@argiva/ui/global.css`). |
| `@argiva/design-tokens` | Theme CSS and the theme registry, through `@argiva/ui` and `@argiva/config`. |

No other package depends on this app. The Dockerfile builds it with `turbo run build --filter=@argiva/web...`, which builds these packages first.

## Rules for contributors

- Write the test first, then the code.
- Don't read `process.env` here. Get settings from `getConfig()` in `@argiva/config`. ESLint blocks `process.env` everywhere except `@argiva/config` and `src/instrumentation.ts` ([ADR 0012](../../docs/adr/0012-config-driven.md)).
- No hard-coded business URLs, domains, emails, phone numbers or prices in `src/`. The URL check allows standard HTTPS Schema.org vocabulary identifiers used by JSON-LD.
- No hex colours in `src/`. Use the `--argiva-*` CSS variables. `lint:no-hex` checks this.
- This is a newer Next.js than most guides describe. Read [AGENTS.md](AGENTS.md) before changing Next.js code.

## Related docs

- [Runbook](../../docs/runbook.md): local setup, [configuration reference](../../docs/runbook.md#2-configuration-reference), deploys, rollback, [troubleshooting](../../docs/runbook.md#8-troubleshooting)
- [Setup guide](../../docs/setup.md): one-time accounts and cloud setup
- [ADR 0003: Cloud hosting](../../docs/adr/0003-cloud-hosting.md)
- [ADR 0004: Tech stack](../../docs/adr/0004-tech-stack.md)
- [ADR 0011: Design direction and switchable themes](../../docs/adr/0011-design-direction-themes.md)
- [ADR 0012: Configuration-driven](../../docs/adr/0012-config-driven.md)
- [ADR 0014: Storefront architecture and draft policy rendering](../../docs/adr/0014-storefront-architecture.md)
- [ADR 0015: Migrations on deploy and browser tests](../../docs/adr/0015-migrations-and-browser-tests.md)
