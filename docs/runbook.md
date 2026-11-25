# argiva runbook

How to run argiva on your own computer, deploy, roll back, and fix common problems.

Who this is for:

- **Developers** need section 1 and section 2.
- **The owner** does the one-time setup first: accounts, tools, Google Cloud, Neon and GitHub settings. All of it is in the [setup guide](setup.md). Sections 6–9 are for everyone after that.

How to read the commands:

- Text in angle brackets, such as `<PROJECT_ID>`, is a value you choose or look up. Replace the whole thing, brackets included.
- No real secret appears in this file. When a command needs a password or connection string, you type it into your own terminal and it never gets saved to a file or to your shell history.
- Commands are for macOS (zsh). They also work in bash.

Related documents: [ADR 0003 cloud hosting](adr/0003-cloud-hosting.md), [ADR 0004 tech stack](adr/0004-tech-stack.md), [ADR 0012 config-driven](adr/0012-config-driven.md), [Phase 2 plan](plans/2026-10-31-phase-2-foundations.md).

---

## 1. Local development

### What you need installed

- **Node.js 22** or newer. Check with `node --version`.
- **Docker Desktop** (or another Docker engine with Compose v2). Check with `docker compose version`.
- You do **not** need to install pnpm (the package manager this repo uses). See the next part.

### How we run pnpm

The repo pins pnpm 12.16.1. Normally Node's built-in helper, Corepack, downloads the right pnpm for you. Corepack can't download through some company network mirrors, so this runbook runs pnpm through `npx` instead:

```sh
npx --loglevel=error pnpm@12.16.1 <script>
```

Putting that command in a shell variable (for example `PNPM="npx ... pnpm@12.16.1"` and then `$PNPM install`) does **not** work in zsh, because zsh doesn't split a variable into separate words. If you want a short form, add an alias to `~/.zshrc` instead:

```sh
alias pnpm='npx --loglevel=error pnpm@12.16.1'
```

The rest of this runbook writes the full `npx` form so that every command works when copied as-is.

### Option A: run the whole site in Docker (closest to production)

This builds the same container image that Cloud Run runs and starts it next to a local Postgres database.

```sh
docker compose up -d --build --wait
```

- `-d` runs everything in the background.
- `--build` rebuilds the image from your current code.
- `--wait` returns only once both the database and the website report healthy.

The first time, and after pulling changes that touch the database, [create the tables and reference data](#storefront-schema-and-content-readiness). Until then pages that read the database show an error.

Then open <http://localhost:3000>. To check it the same way CI does:

```sh
node scripts/smoke.mjs http://127.0.0.1:3000 --noindex
```

To stop it, run `docker compose down`. Add `-v` to also delete the local database and uploaded files.

### Option B: run the dev server (fast reload while you edit code)

1. Install dependencies, once and again whenever `pnpm-lock.yaml` changes:

   ```sh
   npx --loglevel=error pnpm@12.16.1 install
   ```

2. Create your local settings file:

   ```sh
   cp .env.example apps/web/.env.local
   ```

   The dev server runs inside `apps/web`, so it reads `apps/web/.env.local`. A `.env` file at the repo root is **not** read by the dev server. Git ignores both files, so they never get committed.

3. Start only the database from Docker:

   ```sh
   docker compose up -d --wait db
   ```

4. [Create the tables and reference data](#storefront-schema-and-content-readiness).

5. Start the dev server:

   ```sh
   npx --loglevel=error pnpm@12.16.1 dev
   ```

   Open <http://localhost:3000>. The page reloads when you save a file.

### Storefront schema and content readiness

The storefront reads categories, products and policy pages from Postgres. Starting Docker or the dev server does **not** create tables or rows. Deploys do it automatically ([section 6](#6-deploying)); on your own computer you run two commands.

With the local database running, and `apps/web/.env.local` created from `.env.example`:

```sh
set -a
. apps/web/.env.local
set +a
npx --loglevel=error pnpm@12.16.1 --filter @argiva/db db:migrate
npx --loglevel=error pnpm@12.16.1 --filter @argiva/db db:seed
```

- `db:migrate` applies pending database changes. It uses only `DATABASE_URL`, and stops if that is not set. Check that it names the database you mean.
- `db:seed` adds the **reference data**: the six categories and eight draft policy pages. It adds only missing rows and never changes or deletes existing ones.
- Both are safe to run again.

There are **no sample products**. Collections show "There are no products in this collection yet." until real products are entered.

**If you seeded your local database before 26 November 2026**, it still holds invented products, a made-up silver rate and old policy text, because the seed never changes existing rows. To start clean, run the following. It **permanently deletes your local database and uploaded files**:

```sh
docker compose down -v
docker compose up -d --wait db
```

Then run the migrate and seed commands again.

All policy rows are `draft`. The public page shows a draft notice, and draft policy addresses are in the sitemap. Publishing controls don't exist yet.

The SEO routes use `APP_BASE_URL`: `/sitemap.xml` is built from active categories, published products and stored policy pages, and `/robots.txt` permits indexing only in production.

### Business details still needed from the owner

The site shows **"Details coming soon."** in their place. They must be filled in before launch:

- Support phone number, support email and WhatsApp link.
- Seller entity (once registered), proprietor's legal name and business address.
- Grievance officer name, email and phone, and the jurisdiction.
- Terms & Conditions, Privacy Policy and Cookie Notice text, with legal review.
- Flat domestic shipping fee and shipping partner.

Policy text lives in the database. Changing the seed file does not update rows that already exist.

### Browser tests

These open the built site in a real browser at phone and desktop widths. They need the local database server running; they create and **drop** their own databases, `argiva_e2e` and `argiva_empty_e2e`, and refuse any database that isn't local or doesn't end in `_e2e`.

```sh
docker compose up -d --wait db
npx --loglevel=error pnpm@12.16.1 --filter @argiva/web exec playwright install chromium   # once
npx --loglevel=error pnpm@12.16.1 build
npx --loglevel=error pnpm@12.16.1 e2e
```

- They use ports 3200 and 3201.
- To use another local Postgres server, set `E2E_POSTGRES_URL=postgres://<USER>:<PASSWORD>@127.0.0.1:<PORT>` (no database name).
- Run `build` again after changing code; the tests run the last build.
- On failure, the output names the page and fault.

### Other everyday commands

| What it does | Command |
| --- | --- |
| Build every package | `npx --loglevel=error pnpm@12.16.1 build` |
| Run lint checks (ESLint, no-hex-colours, no-hard-coded-values, and the check that every `--argiva-*` style variable exists) | `npx --loglevel=error pnpm@12.16.1 lint` |
| Check TypeScript types | `npx --loglevel=error pnpm@12.16.1 typecheck` |
| Run unit tests | `npx --loglevel=error pnpm@12.16.1 test` |
| Run browser tests (after a build) | `npx --loglevel=error pnpm@12.16.1 e2e` |
| Generate database migrations | `npx --loglevel=error pnpm@12.16.1 --filter @argiva/db db:generate` |
| Apply database migrations | `npx --loglevel=error pnpm@12.16.1 --filter @argiva/db db:migrate` |

ESLint skips third-party and generated folders, including `.claude/`, `.agents/` (agent skills) and `.ua/` (codebase map). CI runs build, lint, typecheck and test in that order (the `verify` job). Two more jobs follow: `container` builds the Docker image, creates the tables and reference data and runs the smoke test; `e2e` runs the browser tests.

### Note on the npm registry used by the Docker build

The `Dockerfile` downloads packages from the public npm registry (`https://registry.npmjs.org/`) by default. It has a build argument, `NPM_CONFIG_REGISTRY`, to point at another registry:

```sh
docker build --build-arg NPM_CONFIG_REGISTRY=<REGISTRY_URL> .
# or, with Compose:
docker compose build --build-arg NPM_CONFIG_REGISTRY=<REGISTRY_URL>
docker compose up -d --wait
```

A company mirror that needs a client certificate on your laptop can't be used this way. The build runs inside a clean container that doesn't have your certificate. If you're on such a network, build on a network that can reach the public registry, or let CI build the image.

---

## 2. Configuration reference

All settings come from environment variables. Only one package, `@argiva/config`, may read them. A lint rule blocks `process.env` everywhere else, and another lint check blocks hard-coded business domains, URLs, emails, phone numbers and prices in code. The URL check permits standard HTTPS Schema.org vocabulary identifiers used by JSON-LD (see [ADR 0012](adr/0012-config-driven.md)).

**Fail fast:** the app checks every setting when it starts. If anything is missing or wrong, it prints `Invalid configuration:` followed by one line per problem (for example `APP_BASE_URL: ...`) and exits. It never runs with a half-valid configuration. An empty value counts as "not set".

Where each value comes from:

- **Local dev server:** `apps/web/.env.local` (copied from `.env.example`).
- **Local Docker:** the `environment:` block in `docker-compose.yml`.
- **Staging and production:** environment variables set on the Cloud Run service by `.github/workflows/deploy.yml`, using GitHub variables ([setup guide section 5](setup.md#5-github-settings)). The database URL comes from Secret Manager ([setup guide section 3.8](setup.md#38-store-the-database-connection-strings-in-secret-manager)).

| Variable | Meaning | Required? | Example | Set in the cloud by |
| --- | --- | --- | --- | --- |
| `APP_ENV` | Which environment this is. Only `production` lets search engines index the site. | Required. One of `local`, `staging`, `production`. | `local` | GitHub environment variable `APP_ENV` |
| `APP_BASE_URL` | The public address of the site. | Required. Must be a full URL. Must start with `https://` unless `APP_ENV=local`. | `http://localhost:3000` | GitHub environment variable `APP_BASE_URL` |
| `INSTAGRAM_URL` | Approved public Instagram profile used by contact/footer links and Organization JSON-LD. | Optional. When set, must be a URL. | `https://www.instagram.com/argiva_silvers/` | GitHub environment variable `INSTAGRAM_URL` |
| `APP_VERSION` | Which build is running. Shown in health checks. | Optional. Defaults to `dev`. | `dev` | Set to the git commit SHA by the deploy workflow |
| `LOG_LEVEL` | How much the app logs. | Optional. One of `debug`, `info`, `warn`, `error`. Defaults to `info`. | `info` | Not set (uses the default) |
| `DATABASE_URL` | Postgres connection string. | Required. Must start with `postgres://` or `postgresql://`. | `postgres://argiva:argiva_local_only@localhost:5432/argiva` | Secret Manager secret named in `DATABASE_URL_SECRET` |
| `STORAGE_DRIVER` | Where uploaded files go. | Required. `local` or `r2`. | `local` | Fixed to `local` by the deploy workflow for now (see note) |
| `STORAGE_LOCAL_DIR` | Folder for uploads when `STORAGE_DRIVER=local`. | Required when `local`. | `./.data/uploads` | Fixed to `/tmp/uploads` by the deploy workflow |
| `R2_ACCOUNT_ID` | Cloudflare R2 account. | Required when `STORAGE_DRIVER=r2`. | — | Not used yet |
| `R2_BUCKET` | Cloudflare R2 bucket name. | Required when `r2`. | — | Not used yet |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 access key ID. | Required when `r2`. Secret. | — | Not used yet |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 secret key. | Required when `r2`. Secret. | — | Not used yet |
| `DEFAULT_THEME_ID` | Site theme until the admin "Appearance" setting exists. | Optional. `quiet-luxury`, `warm-craft` or `modern-bold`. Defaults to the design-token default. | `quiet-luxury` | Not set (uses the default) |

Note on storage: in the cloud, `STORAGE_DRIVER=local` with `/tmp/uploads` is temporary. Cloud Run's disk is wiped whenever an instance stops. Nothing uploads files yet. A later phase switches the cloud to Cloudflare R2 before any upload feature ships.

Build-time only (not read by the app): `NPM_CONFIG_REGISTRY`, a Docker build argument (see section 1).

---

## 3. One-time cloud setup (owner)

Moved to the [setup guide, section 3](setup.md#3-google-cloud-setup): the Google Cloud project, the budget alert, the image repository, service accounts, Secret Manager, and the GitHub login (Workload Identity Federation). The sub-section numbers (3.1–3.9) are the same there.

---

## 4. Neon setup (owner)

Moved to the [setup guide, section 4](setup.md#4-neon-setup).

---

## 5. GitHub settings (owner)

Moved to the [setup guide, section 5](setup.md#5-github-settings): variables, environments and branch protection. The sub-section numbers (5.1–5.4) are the same there. Whether the repository is public or private changes what's available; see [setup guide section 2.2](setup.md#22-github-account-and-plan).

---

## 6. Deploying

### How it works

```mermaid
flowchart LR
  PR[Pull request] --> CI1[CI: verify, container, e2e]
  CI1 -->|merge| Main[main]
  Main --> CI2[CI on main]
  CI2 -->|success| Stg[Deploy staging: build, migrate, load reference data, deploy, smoke test]
  Stg --> Tag[Owner tags vX.Y.Z]
  Tag --> Approve[Owner approves in GitHub]
  Approve --> Prod[Deploy production: migrate, load reference data, deploy same image, smoke test]
```

- **Staging is automatic.** When CI passes on `main`, the "Deploy staging" workflow:
  1. builds the image `asia-south1-docker.pkg.dev/<PROJECT_ID>/argiva/web:<commit SHA>`;
  2. pushes it to Artifact Registry;
  3. applies database migrations and loads missing reference data;
  4. deploys the image to `argiva-web-staging`;
  5. runs `scripts/smoke.mjs` against the live URL.

  If step 3 fails, nothing is deployed and the old version keeps serving. Steps 3–5 are the same for production.

> **Before the first merge of this change to `main`:** give the deployer access to the database secrets ([setup guide section 3.8](setup.md#38-store-the-database-connection-strings-in-secret-manager)). Without it the deploy stops at the migration step.
- **Production is manual.** It deploys the **same image** that staging built and tested. It never rebuilds.

Every deploy sets:

- the variables `APP_ENV`, `APP_BASE_URL`, `APP_VERSION` (= the commit SHA), `STORAGE_DRIVER=local` and `STORAGE_LOCAL_DIR=/tmp/uploads`;
- the secret `DATABASE_URL` (latest version);
- 1 CPU, 512 MiB memory, 0 minimum instances (scales to zero), at most `CLOUD_RUN_MAX_INSTANCES` instances, up to 80 requests per instance at once, port 8080.

### Release to production

1. Check staging works. Find its URL with:

   ```sh
   gcloud run services describe argiva-web-staging --region asia-south1 --format='value(status.url)'
   ```

2. Find the commit SHA that staging is running. It's in the "Deploy staging" run on the GitHub **Actions** tab, or in `/api/health` as the version.
3. Tag that exact commit and push the tag. The SHA must be one that staging has already built, because production only reuses images:

   ```sh
   git tag v<X.Y.Z> <SHA>
   git push origin v<X.Y.Z>
   ```

   Use a new version number each time, for example `v0.1.0`, then `v0.1.1`.
4. On GitHub, open **Actions → Deploy production**, click **Review deployments**, and approve.
5. The workflow deploys and runs the smoke test (without `--noindex`, because production should be indexable). A green run means production is live.

### First deploy of staging (the `APP_BASE_URL` chicken-and-egg)

Cloud Run gives each service its address only after the first deploy, but the app needs `APP_BASE_URL` to start. Do this:

1. Set staging's `APP_BASE_URL` to a temporary `https://` placeholder, for example `https://staging.invalid`.
2. Let the first staging deploy run.
3. Read the real address:

   ```sh
   gcloud run services describe argiva-web-staging --region asia-south1 --format='value(status.url)'
   ```

4. Put that address into staging's `APP_BASE_URL`, then on the Actions tab re-run the latest "Deploy staging" run.

The placeholder is harmless for this one deploy. Nothing in Phase 2 builds links from `APP_BASE_URL`, and the smoke test reads the address from `gcloud`, not from the variable. Do the same for production's first deploy if its custom domain isn't connected yet.

---

## 7. Rollback

Every deploy leaves the previous revisions in place. Rolling back means sending visitors to an older revision. It takes seconds and doesn't rebuild anything.

```sh
# 1. List revisions, newest first. Pick the last one that worked.
gcloud run revisions list --service <SERVICE> --region asia-south1

# 2. Send all traffic to it.
gcloud run services update-traffic <SERVICE> --region asia-south1 --to-revisions <REVISION>=100
```

`<SERVICE>` is `argiva-web` (production) or `argiva-web-staging`. `<REVISION>` is a name from the list, such as `argiva-web-00012-abc`.

Cloud Run switches traffic straight away. It doesn't re-run health checks, so open the site afterwards (or run `node scripts/smoke.mjs <URL>`).

**After a rollback, new deploys don't get traffic automatically.** Pinning traffic to a revision stays in force for later deploys. Once a fix is deployed and checked, send traffic back to the newest revision:

```sh
gcloud run services update-traffic <SERVICE> --region asia-south1 --to-latest
```

Until you do that, the smoke test in the deploy workflow checks the pinned old revision, not the new one.

Another option: on the GitHub Actions tab, re-run the "Deploy production" run of an earlier tag. That creates a new revision from the older image. It only works while that image is among the last 10 kept ([setup guide section 3.6](setup.md#36-create-the-image-repository-and-keep-only-the-last-10-images)), and the same traffic note applies if traffic is pinned.

**Database changes aren't rolled back by any of this.** So every migration must keep the previous app version working: add new tables or columns first, and remove or rename old ones only in a later release, once no version that uses them can be rolled back to. Neon's point-in-time restore is the fallback for damaged data.

---

## 8. Troubleshooting

**The app exits at start with `Invalid configuration:`**
The lines that follow name each bad setting, in the form `VARIABLE: what's wrong`. Fix the value in `apps/web/.env.local` (locally) or in the GitHub environment variables (cloud), then restart or redeploy. Common causes: `APP_BASE_URL` without `https://` outside local, a missing `DATABASE_URL`, or a typo in `APP_ENV`.

**`/api/ready` returns 503 with `"db":"down"`**
The app couldn't reach the database within 2 seconds.

- **Cloud:** Neon's free plan pauses an idle database and takes a moment to wake. Wait a few seconds and try again. The smoke test already retries each check 5 times, 2 seconds apart. If it keeps failing, check the Neon dashboard and the secret's value.
- **Local:** check that the database container is running, with `docker compose ps`.

**The deploy fails at "Migrate database and load reference data"**
Nothing was deployed. Read the step's log:
- `PERMISSION_DENIED` on the secret: run the deployer command in [setup guide section 3.8](setup.md#38-store-the-database-connection-strings-in-secret-manager).
- `ERR_MODULE_NOT_FOUND`: the packages the seed depends on weren't built; the "Install database tools" step does that.
- A connection error: check the Neon dashboard and the secret's value, then re-run the workflow.
- A migration error: fix the migration in a new commit. Don't edit one that has already been applied anywhere.

**A policy route returns 404, or policy URLs are missing from `/sitemap.xml`**
The route and sitemap use rows from the `policies` table. Run [the migrate and seed commands](#storefront-schema-and-content-readiness) against the intended database; deploys do this automatically.

**A storefront page fails while catalog or policy data is being read**
Run [the migrate command](#storefront-schema-and-content-readiness) for the database named by `DATABASE_URL`. The `/api/ready` endpoint checks connectivity only; it does not check the full application schema.

**The first request after a quiet period is slow**
That's a **cold start**: Cloud Run is starting an instance from zero, which typically takes a second or a few seconds. It's the trade-off for scaling to zero and paying nothing while idle.

**Reading the logs**

```sh
gcloud run services logs read <SERVICE> --region asia-south1
```

Or, in the Google Cloud console, open **Cloud Run → `<SERVICE>` → Logs**.

**The deploy fails at the "auth" step**
- Check `GCP_WIF_PROVIDER` and `GCP_DEPLOY_SA` against [setup guide section 3.9](setup.md#39-let-github-actions-log-in-workload-identity-federation).
- Check that `<GITHUB_OWNER>/<REPO>` in the provider condition matches the repository exactly.
- New permissions can take up to 5 minutes. Re-run the workflow.

**The deploy fails with "permission denied" on `--allow-unauthenticated`**
- The deployer needs `roles/run.admin` ([setup guide section 3.7](setup.md#37-create-the-two-service-accounts)).
- If your Google account belongs to a company organisation, an organisation policy may block public services. Ask the organisation admin.

**The deploy workflows don't start at all**
- Check that `GCP_PROJECT_ID` is set ([setup guide section 5.1](setup.md#51-repository-variables)).
- Check that `deploy-staging.yml` is on `main` ([setup guide section 5.4](setup.md#54-things-to-know)).

**`docker compose up --build` fails while downloading packages**
See the registry note in section 1.

---

## 9. Costs

The aim is roughly ₹0 a month while traffic is low. A ₹500 alert ([setup guide section 3.4](setup.md#34-set-a-500-monthly-budget-alert)) catches surprises.

| Service | Why it should stay cheap | Check current pricing |
| --- | --- | --- |
| Cloud Run | Scales to zero instances when idle, and charges only while handling requests. Expected to stay within the free tier at our expected traffic. | <https://cloud.google.com/run/pricing> |
| Artifact Registry | The cleanup policy keeps only the last 10 images. Expected to stay within the free tier, or cost a few rupees. | <https://cloud.google.com/artifact-registry/pricing> |
| Secret Manager | Two small secrets, read only when an instance starts. Expected to stay within the free tier. | <https://cloud.google.com/secret-manager/pricing> |
| Workload Identity Federation | No charge expected for this use. | Google Cloud IAM docs |
| Neon | Free plan. Pauses when idle. | <https://neon.tech/pricing> |

Free-tier limits change. Check each provider's current pricing page instead of relying on numbers written here.

To see how much space the stored images use:

```sh
gcloud artifacts repositories describe argiva --location=asia-south1 --format='value(sizeBytes)'
```

**The budget alert only sends email.** It does not switch anything off. If an alert arrives:

1. Check **Billing → Reports** in the console to see which service is costing money.
2. Lower `CLOUD_RUN_MAX_INSTANCES` if traffic is the cause.
