# ARGIVA Silvers

![ARGIVA Silvers logo](docs/assets/argiva.jpeg)

The official website and online store for ARGIVA Silvers.

Right now it's a holding page with the design system, health checks, Docker setup, CI and deploy pipelines in place. The store features come in later phases.

## What's in the repo

| Path | What it is |
| --- | --- |
| `apps/web` | The website (Next.js 16): holding page, `/api/health` and `/api/ready` |
| `apps/ui-preview` | A preview page for the design system's components and themes |
| `packages/ui` | Shared React components, themes and fonts |
| `packages/design-tokens` | Colours, type and spacing for each theme |
| `packages/config` | Typed settings. It's the only code that reads environment variables. |
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
2. From the repo folder, build and start the website and a local Postgres database:

   ```sh
   docker compose up -d --build --wait
   ```

3. Open <http://localhost:3000>. You should see "ARGIVA Silvers" and the tagline.
4. Optional: run the same checks CI does:

   ```sh
   node scripts/smoke.mjs http://127.0.0.1:3000 --noindex
   ```

5. To stop, run `docker compose down`. Add `-v` to also delete the local database and uploaded files.

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

4. Start the dev server and open <http://localhost:3000>:

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
| Lint (ESLint, no-hex-colours, no-hard-coded-values) | `npx --loglevel=error pnpm@12.16.1 lint` |
| Check types | `npx --loglevel=error pnpm@12.16.1 typecheck` |
| Run all tests | `npx --loglevel=error pnpm@12.16.1 test` |

CI runs these four in this order, then builds the Docker image and runs the smoke test. If they pass on your computer, CI should pass too.

## Deploying

- Merging to `main` deploys to **staging** on Google Cloud Run (Mumbai), once CI passes.
- Pushing a version tag such as `v1.0.0` promotes the same image to **production**, after the owner approves it.
- The deploy workflows do nothing until the one-time cloud setup is finished. See the [setup guide](docs/setup.md), sections 3–5.

For rollback and troubleshooting, see the [runbook](docs/runbook.md).
