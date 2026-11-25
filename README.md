# ARGIVA Silvers

![ARGIVA Silvers logo](docs/assets/argiva.jpeg)

The official website and online store for ARGIVA Silvers.

The current build includes the storefront: home and collection pages, product details, search, a browser-persisted cart, brand information, draft policy routes, and SEO metadata. Checkout, payments and the admin dashboard are later phases.

## What's in the repo

| Path | What it is |
| --- | --- |
| `apps/web` | The Next.js 16 storefront: collections, products, cart, search, brand and policy pages, SEO, `/api/health` and `/api/ready` |
| `apps/ui-preview` | A preview page for the design system's components and themes |
| `packages/ui` | Shared React components, themes and fonts |
| `packages/design-tokens` | Colours, type and spacing for each theme |
| `packages/config` | Typed settings. It's the only code that reads environment variables. |
| `packages/db` | Database schema (Drizzle ORM), migrations and connection pooling |
| `packages/domain` | Pure business logic: composition labelling, pricing engine, stock reservations |
| `scripts/` | Lint checks and the smoke test |
| `docs/` | [Docs index](docs/README.md): [setup guide](docs/setup.md), [runbook](docs/runbook.md), [decisions (ADRs)](docs/adr/README.md), [plans](docs/plans/README.md), [brand content](docs/brand-content.md) |
| `sdd/` | Project state and progress logs |

## First-time setup

New to the project? Start with the [setup guide](docs/setup.md). It covers:

- installing the tools;
- creating the GitHub, Google Cloud and Neon accounts, including which GitHub plan to use;
- the one-time cloud and GitHub settings needed before the first deploy.

To work on the site locally, you only need the tools below.

## Before you start

- **Node.js 22** or newer. Check with `node --version`.
- **Docker Desktop**, running. Check with `docker compose version`.
- You **don't** need to install pnpm. Run it through npx:

  ```sh
  npx --loglevel=error pnpm@12.16.1 <script>
  ```

  To save typing, add this alias to `~/.zshrc`. The [runbook](docs/runbook.md#how-we-run-pnpm) explains why.

  ```sh
  alias pnpm='npx --loglevel=error pnpm@12.16.1'
  ```

## Start-up steps

### Option A: run the whole site in Docker (closest to production)

1. Start Docker Desktop. On macOS you can run `open -a Docker`.
2. Start the local Postgres database:

   ```sh
   docker compose up -d --wait db
   ```

3. Apply the database migrations as described in the [runbook's storefront schema section](docs/runbook.md#storefront-schema-and-content-readiness). Compose does not apply migrations or seed data automatically.
4. Build and start the site:

   ```sh
   docker compose up -d --build --wait
   ```

5. Open <http://localhost:3000>. The database-backed catalog needs its schema and data. After applying migrations, use the target-safe `db:seed` steps in the [runbook](docs/runbook.md#storefront-schema-and-content-readiness) to add local catalog and draft policy rows.
6. Optional: run the same checks CI does:

   ```sh
   node scripts/smoke.mjs http://127.0.0.1:3000 --noindex
   ```

7. To stop, run `docker compose down`. Add `-v` to also delete the local database and uploaded files.

### Option B: run the dev server (fast reload while you edit)

1. Install dependencies. Do this once, and again whenever `pnpm-lock.yaml` changes:

   ```sh
   npx --loglevel=error pnpm@12.16.1 install
   ```

2. Create your local settings file. It's never committed.

   ```sh
   cp .env.example apps/web/.env.local
   ```

3. Start only the database:

   ```sh
   docker compose up -d --wait db
   ```

4. Apply the database migrations as described in the [runbook](docs/runbook.md#storefront-schema-and-content-readiness). Migrations are not applied automatically. Policy routes also need seeded policy rows; follow the runbook's target-safe `db:seed` steps.

5. Start the dev server and open <http://localhost:3000>:

   ```sh
   npx --loglevel=error pnpm@12.16.1 dev
   ```

If a setting is missing or wrong, the website won't start and prints which settings to fix. Every setting is listed in [`.env.example`](.env.example) and the [runbook's configuration reference](docs/runbook.md#2-configuration-reference).

### Design system preview

To see every component in every theme, run this and open <http://localhost:5174>:

```sh
npx --loglevel=error pnpm@12.16.1 ui:preview
```

## Everyday commands

| What it does | Command |
| --- | --- |
| Build everything | `npx --loglevel=error pnpm@12.16.1 build` |
| Lint (ESLint, no-hex-colours, no-hard-coded-values, style-variable names) | `npx --loglevel=error pnpm@12.16.1 lint` |
| Check types | `npx --loglevel=error pnpm@12.16.1 typecheck` |
| Run all tests | `npx --loglevel=error pnpm@12.16.1 test` |

CI runs these four in this order, then builds the Docker image and runs the smoke test. If they pass on your computer, CI should pass too.

## Deploying

- Merging to `main` deploys to **staging** on Google Cloud Run (Mumbai), once CI passes.
- Pushing a version tag such as `v1.0.0` promotes the same image to **production**, after the owner approves it.
- The deploy workflows do nothing until the one-time cloud setup is finished. See the [setup guide](docs/setup.md), sections 3–5.

For rollback and troubleshooting, see the [runbook](docs/runbook.md).
