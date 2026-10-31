# argiva setup guide

Everything you need to set up **once** before argiva can be built on your computer and deployed to the internet: accounts, tools, Google Cloud, the Neon database, and GitHub settings.

For everyday work after setup (running locally, deploying, rolling back, fixing problems, costs), see the [runbook](runbook.md).

How to read the commands:

- Text in angle brackets, such as `<PROJECT_ID>`, is a value you choose or look up. Replace the whole thing, brackets included.
- No real secret appears in this file. When a command needs a password or connection string, you type it into your own terminal. It never gets saved to a file, a chat, or your shell history.
- Commands are for macOS (zsh). They also work in bash.

---

## 1. Overview and checklist

Do the steps in this order. Each one depends on the ones before it.

| # | Step | Where | Needed for |
| --- | --- | --- | --- |
| 1 | Install the tools on your computer | [2.1](#21-tools-on-your-computer) | Running the site locally |
| 2 | GitHub account and plan choice | [2.2](#22-github-account-and-plan) | Storing code, CI, deploys |
| 3 | Google account and Google Cloud billing | [2.3](#23-google-account-and-google-cloud-billing) | Hosting |
| 4 | Neon account | [2.4](#24-neon-account) | The database |
| 5 | Commit and push the code to `main` | [2.5](#25-push-the-code) | CI starts running |
| 6 | Google Cloud project, budget, services, accounts, login for GitHub | [3](#3-google-cloud-setup) | Deploys |
| 7 | Neon project and branches | [4](#4-neon-setup) | Staging and production data |
| 8 | Database secrets in Google | [3.8](#38-store-the-database-connection-strings-in-secret-manager) | The site can reach the database |
| 9 | GitHub variables, environments and branch rules | [5](#5-github-settings) | Deploys |
| 10 | First deploy and check | [6](#6-first-deploy-and-check) | Staging is live |

Only steps 1, 2 and 5 are needed to work on the site locally. Steps 3–10 are only for putting it on the internet.

---

## 2. Accounts and tools

### 2.1 Tools on your computer

| Tool | Why | Install | Check |
| --- | --- | --- | --- |
| **Git** | Version control | Comes with Apple's Command Line Tools: run `xcode-select --install` | `git --version` |
| **Node.js 22 or newer** | Builds and runs the site | <https://nodejs.org> (choose the LTS installer), or Homebrew: `brew install node@22` | `node --version` |
| **Docker Desktop** | Runs the site and database exactly as in production | <https://www.docker.com/products/docker-desktop/> | `docker compose version` |
| **Google Cloud CLI (`gcloud`)** | One-time cloud setup (section 3) | <https://cloud.google.com/sdk/docs/install> | `gcloud --version` |
| GitHub CLI (`gh`), optional | Set GitHub variables from the terminal | <https://cli.github.com> | `gh --version` |
| VS Code, optional | Editor | <https://code.visualstudio.com> | |

You **don't** need to install pnpm (the package manager). The repo runs it through `npx`. See [runbook section 1](runbook.md#how-we-run-pnpm).

Docker Desktop's licence is free for personal use and small businesses. Check its current terms on the Docker website if your business grows.

### 2.2 GitHub account and plan

1. If you don't have one, sign up at <https://github.com/signup>. Turn on two-factor authentication: **Settings → Password and authentication**.
2. The repository is `github.com/surendar0101/argiva`.
3. Decide whether the repository is **public** or **private**. On the free plan this decides which safety features you get.

| Feature we use | Free, public repo | Free, private repo | Pro, private repo |
| --- | --- | --- | --- |
| CI on every push | Yes, unlimited minutes | Yes, within a monthly free quota | Yes, bigger quota |
| Environments (`staging`, `production`) with their own variables | Yes | **No** | Yes |
| Your approval before each production deploy ("required reviewers") | Yes | **No** | **No** (needs Enterprise for private repos) |
| Protecting `main` (CI must pass first) | Yes | **No** | Yes |

Check GitHub's current pricing page before you decide, because plans change: <https://github.com/pricing>.

**Recommended: Free plan with a public repository.** Everything in this guide works as written. Nothing secret is in the repository:

- GitHub logs in to Google with short-lived tokens, so no key is stored.
- Database passwords live in Google Secret Manager.
- `.env.local` files are never committed.

What becomes public: the code and the documents in `docs/` and `sdd/`, including decisions, plans, the budget and brand content.

**Free plan with a private repository** works too, but the deploy workflows must first be changed:

- Per-environment variables become repository variables with `STAGING_` / `PROD_` prefixes.
- Pushing a version tag replaces the approval step.
- Google login is limited to `main` and version tags.

Those changes are **not made yet**. Tell the assistant which option you chose, and it will update the workflows and section 5 of this guide.

To change visibility: **Settings → General → Danger Zone → Change repository visibility**.

### 2.3 Google account and Google Cloud billing

1. Use a Google account that you control, preferably the business one. All cloud resources will belong to it.
2. Open <https://console.cloud.google.com>, accept the terms, and choose your country.
3. Create a **billing account** under **Billing → Manage billing accounts → Create account**. Follow the prompts: it asks for a payment method and may ask for business details. Google sometimes offers new accounts a free trial credit; the sign-up page shows the current offer.
4. Note the billing account's **currency**. The ₹500 budget alert in section 3.4 must use the same currency.
5. Install the `gcloud` CLI (section 2.1) and log in:

   ```sh
   gcloud auth login
   gcloud billing accounts list
   ```

   The second command shows your billing account ID, which looks like `XXXXXX-XXXXXX-XXXXXX`. You need it in section 3.2.

Why Google Cloud Run in Mumbai: see [ADR 0003](adr/0003-cloud-hosting.md).

### 2.4 Neon account

1. Sign up at <https://neon.tech>. Using "Sign in with GitHub" or your Google account is fine.
2. Stay on the free plan. Don't create the project yet; section 4 covers that.

Why Neon: see [ADR 0004](adr/0004-tech-stack.md).

### 2.5 Push the code

All workflows, deploys and branch protection use a branch called `main`. It must exist on GitHub and be the **default branch**.

If you haven't got `main` yet (for example, the work is on `develop`), create it once:

```sh
git switch develop
git pull
git switch -c main
git push -u origin main
```

Then on GitHub go to **Settings → General → Default branch**, switch it to `main` and confirm. You can delete leftover branches such as `master` from the **Branches** page afterwards.

From then on, review the changes, then commit and push them to `main` yourself:

```sh
git status
git add -A
git commit -m "Describe the change"
git push origin main
```

Then open the repository's **Actions** tab. The **CI** workflow should run and turn green. The deploy workflows show as skipped until section 5 is finished. That's expected.

---

## 3. Google Cloud setup

This sets up Google Cloud so that GitHub can deploy the site. Do it once. It takes about an hour, and most of that is waiting for pages to load.

### Words used in this section

- **Google Cloud project:** a container for everything argiva uses in Google Cloud. Billing and permissions are attached to it.
- **Cloud Run:** the Google service that runs our container image and gives it a web address. It starts copies of the site ("instances") when visitors arrive and stops them when nobody is visiting.
- **Revision:** every deploy to Cloud Run creates a new, numbered, unchangeable revision. Older revisions stay available, which is what makes rollback possible.
- **Artifact Registry:** Google's storage for container images. CI pushes each built image here.
- **Service account:** a non-human Google account that a program uses. We make two of them:
  - `argiva-deployer` is used by GitHub Actions to push images and deploy.
  - `argiva-runtime` is the identity the running website uses. It can read only the database secret.
- **Secret Manager:** Google's locked store for secrets such as the database password. The site reads the secret when it starts. The secret never appears in GitHub or in the code.
- **Workload Identity Federation (WIF):** lets GitHub Actions log in to Google Cloud with a short-lived token that GitHub issues for each workflow run. No long-lived key file is created or stored anywhere, so there is nothing to leak. The token uses a standard called **OIDC** (OpenID Connect).
- **Role:** a named set of permissions, such as `roles/run.admin`.

### 3.1 Install and log in to the Google Cloud CLI

If you didn't already do it in section 2.3, install `gcloud` (<https://cloud.google.com/sdk/docs/install>) and log in:

```sh
gcloud auth login
```

### 3.2 Choose names and keep them in your terminal

Paste this block once, after replacing the placeholders. The later commands reuse these values. If you open a new terminal window, paste the block again.

```sh
PROJECT_ID="<PROJECT_ID>"                  # your choice: 6–30 characters, lowercase letters, digits and hyphens, globally unique, e.g. argiva-site
BILLING_ACCOUNT_ID="<BILLING_ACCOUNT_ID>"  # from: gcloud billing accounts list
GITHUB_REPO="<GITHUB_OWNER>/<REPO>"        # e.g. surendar0101/argiva
REGION="asia-south1"                       # Mumbai
POOL="github"                              # WIF pool name (you can keep this)
PROVIDER="argiva-repo"                     # WIF provider name (you can keep this)
DEPLOYER_SA="argiva-deployer@${PROJECT_ID}.iam.gserviceaccount.com"
RUNTIME_SA="argiva-runtime@${PROJECT_ID}.iam.gserviceaccount.com"
```

### 3.3 Create the project and link billing

```sh
gcloud projects create "$PROJECT_ID" --name="argiva"
gcloud config set project "$PROJECT_ID"
gcloud billing projects link "$PROJECT_ID" --billing-account="$BILLING_ACCOUNT_ID"
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
echo "$PROJECT_NUMBER"
```

The project number is a long number that Google assigns. Some later values need it.

### 3.4 Set a ₹500 monthly budget alert

A budget alert sends an email when spending passes 50 %, 90 % and 100 % of ₹500 in a month. **It does not stop spending.** It only warns you.

```sh
gcloud services enable billingbudgets.googleapis.com
gcloud billing budgets create \
  --billing-account="$BILLING_ACCOUNT_ID" \
  --display-name="argiva monthly" \
  --budget-amount=500INR \
  --threshold-rule=percent=0.5 \
  --threshold-rule=percent=0.9 \
  --threshold-rule=percent=1.0 \
  --filter-projects="projects/$PROJECT_ID"
```

- The emails go to the billing account's administrators and billing users, which is you.
- The currency in `--budget-amount` must match your billing account's currency. If your billing account isn't in INR, the command fails. Use the account's currency, or create the budget in the console instead: <https://console.cloud.google.com/billing/budgets>.
- If anything about the flags fails, run `gcloud billing budgets create --help` to see the exact flags your installed version accepts.

### 3.5 Turn on the Google services we use

```sh
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  iamcredentials.googleapis.com \
  secretmanager.googleapis.com \
  sts.googleapis.com
```

`iamcredentials` and `sts` are the two services behind Workload Identity Federation.

### 3.6 Create the image repository and keep only the last 10 images

```sh
gcloud artifacts repositories create argiva \
  --repository-format=docker \
  --location="$REGION" \
  --description="argiva container images"
```

Old images cost storage, so a **cleanup policy** deletes them automatically. A "keep" rule alone deletes nothing. You need a "delete everything" rule plus a "keep the 10 newest" rule. When both rules match an image, the keep rule wins.

```sh
cat > /tmp/argiva-cleanup-policy.json <<'EOF'
[
  {
    "name": "delete-old",
    "action": { "type": "Delete" },
    "condition": { "tagState": "any" }
  },
  {
    "name": "keep-last-10",
    "action": { "type": "Keep" },
    "mostRecentVersions": { "keepCount": 10 }
  }
]
EOF

# 1. Preview first: this only logs what it would delete.
gcloud artifacts repositories set-cleanup-policies argiva \
  --location="$REGION" --policy=/tmp/argiva-cleanup-policy.json --dry-run

# 2. Then turn it on for real.
gcloud artifacts repositories set-cleanup-policies argiva \
  --location="$REGION" --policy=/tmp/argiva-cleanup-policy.json --no-dry-run
```

Cleanup runs in the background and can take about a day to start working.

**Important:** production deploys reuse an image that staging already built (see [runbook section 6](runbook.md#6-deploying)). Production can only deploy a commit whose image is still among the 10 newest. Tag releases soon after staging is verified.

### 3.7 Create the two service accounts

```sh
gcloud iam service-accounts create argiva-deployer --display-name="argiva deployer (GitHub Actions)"
gcloud iam service-accounts create argiva-runtime  --display-name="argiva runtime (Cloud Run)"
```

Give the deployer only what deploying needs:

```sh
# Deploy and manage Cloud Run services in this project.
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$DEPLOYER_SA" --role="roles/run.admin"

# Push images to the argiva image repository.
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$DEPLOYER_SA" --role="roles/artifactregistry.writer"

# Start Cloud Run services that run as argiva-runtime (on that one account only, not project-wide).
gcloud iam service-accounts add-iam-policy-binding "$RUNTIME_SA" \
  --member="serviceAccount:$DEPLOYER_SA" --role="roles/iam.serviceAccountUser"
```

Why `run.admin` and not the smaller `run.developer`: the deploy uses `--allow-unauthenticated` so that the public can visit the site. That flag changes who may call the service, and only `run.admin` includes that permission. The role applies to this project only.

The runtime account gets no project-wide roles. Section 3.8 lets it read the two database secrets and nothing else.

### 3.8 Store the database connection strings in Secret Manager

Do section 4 (Neon) first so that you have the two connection strings. Then create one secret per environment. The secrets are kept in Mumbai only:

```sh
gcloud secrets create argiva-staging-database-url    --replication-policy=user-managed --locations="$REGION"
gcloud secrets create argiva-production-database-url --replication-policy=user-managed --locations="$REGION"
```

Add each value without it showing on screen or in your shell history. Run the first line, paste the **staging** connection string, and press Enter:

```sh
read -rs DB_URL
printf '%s' "$DB_URL" | gcloud secrets versions add argiva-staging-database-url --data-file=-
unset DB_URL
```

Repeat with the **production** connection string and `argiva-production-database-url`.

(`printf '%s'` matters. It sends the value without an extra line break at the end, which would otherwise become part of the password.)

Let the runtime account read these two secrets, and only these:

```sh
for SECRET in argiva-staging-database-url argiva-production-database-url; do
  gcloud secrets add-iam-policy-binding "$SECRET" \
    --member="serviceAccount:$RUNTIME_SA" --role="roles/secretmanager.secretAccessor"
done
```

To change a value later, run the `read` / `printf` lines again. That adds a new version. Cloud Run reads `latest` whenever an instance starts, so redeploy (or wait for instances to restart) to use the new value.

### 3.9 Let GitHub Actions log in (Workload Identity Federation)

These steps follow the official guide in the `google-github-actions/auth` README ("Workload Identity Federation through a Service Account").

```sh
# 1. A pool groups outside identity providers.
gcloud iam workload-identity-pools create "$POOL" \
  --project="$PROJECT_ID" --location="global" \
  --display-name="GitHub Actions"

# 2. A provider trusts GitHub's token issuer, but only for tokens from our repository.
gcloud iam workload-identity-pools providers create-oidc "$PROVIDER" \
  --project="$PROJECT_ID" --location="global" \
  --workload-identity-pool="$POOL" \
  --display-name="argiva repository" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='$GITHUB_REPO'"

# 3. Allow workflows from our repository to act as argiva-deployer.
gcloud iam service-accounts add-iam-policy-binding "$DEPLOYER_SA" \
  --project="$PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL/attribute.repository/$GITHUB_REPO"

# 4. Print the provider's full name. This is the GCP_WIF_PROVIDER value for section 5.
gcloud iam workload-identity-pools providers describe "$PROVIDER" \
  --project="$PROJECT_ID" --location="global" \
  --workload-identity-pool="$POOL" --format="value(name)"
```

Step 4 prints something like `projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/github/providers/argiva-repo`.

The `--attribute-condition` line matters for security. Without it, any GitHub repository could ask for a token. With it, only `<GITHUB_OWNER>/<REPO>` can.

New permissions can take up to 5 minutes to take effect. If the first deploy fails at the "auth" step straight after setup, wait and re-run it.

---

## 4. Neon setup

**Neon** is the hosted Postgres database service (see [ADR 0004](adr/0004-tech-stack.md)). Its free plan pauses the database when nobody uses it and wakes it on the next request.

1. In Neon, create a project named `argiva`.
2. **Region:** pick the region closest to Mumbai from Neon's current list. Check the list at the time you sign up, because it changes. If Neon offers no region in India, choose the nearest one and **note it for the data-protection (DPDP) review**, because customer data would then be stored outside India. Record your choice in [docs/decisions.md](decisions.md).
3. **Branches:** a Neon branch is a separate copy of the database.
   - The default branch (usually called `main`) is **production**.
   - Create a second branch named `staging` from it. Staging gets its own data, so testing can't touch production data.
4. For each branch, copy the connection string:
   - Use the **pooled** connection string (its host name contains `-pooler`). Pooling lets many short Cloud Run requests share a few database connections.
   - Make sure it ends with `sslmode=require` so that traffic is encrypted.
   - It starts with `postgresql://`. The app accepts that.
5. Put the two strings into Secret Manager as described in section 3.8. Don't paste them anywhere else: not into GitHub, not into a chat, not into a file in the repo.

---

## 5. GitHub settings

All of this is in the repository's **Settings** on github.com. No GitHub secrets are needed, because Google login uses Workload Identity Federation (section 3.9).

This section assumes a **public** repository, or a plan that includes environments (see section 2.2). On a private repository with the free plan, wait for the workflow changes described in section 2.2 before doing this section.

### 5.1 Repository variables

Go to **Settings → Secrets and variables → Actions → Variables tab → New repository variable**.

| Name | Value |
| --- | --- |
| `GCP_PROJECT_ID` | `<PROJECT_ID>` |
| `GCP_REGION` | `asia-south1` |
| `GCP_AR_REPOSITORY` | `argiva` |
| `GCP_WIF_PROVIDER` | the output of section 3.9 step 4: `projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/<POOL>/providers/<PROVIDER>` |
| `GCP_DEPLOY_SA` | `argiva-deployer@<PROJECT_ID>.iam.gserviceaccount.com` |

Both deploy workflows skip themselves until `GCP_PROJECT_ID` is set. Set it **last**, once everything else is in place.

### 5.2 Environments

Go to **Settings → Environments → New environment**. Create `staging` and `production`, and add these **environment variables** to each:

| Name | `staging` | `production` |
| --- | --- | --- |
| `CLOUD_RUN_SERVICE` | `argiva-web-staging` | `argiva-web` |
| `GCP_RUNTIME_SA` | `argiva-runtime@<PROJECT_ID>.iam.gserviceaccount.com` | same |
| `APP_ENV` | `staging` | `production` |
| `APP_BASE_URL` | the staging URL (see [first deploy](runbook.md#first-deploy-of-staging-the-app_base_url-chicken-and-egg) in the runbook) | the production URL (`https://`) |
| `DATABASE_URL_SECRET` | `argiva-staging-database-url` | `argiva-production-database-url` |
| `CLOUD_RUN_MAX_INSTANCES` | `2` | `2` |

`CLOUD_RUN_MAX_INSTANCES` caps how many copies of the site can run at once. That limits the cost if something floods the site with traffic.

On the **production** environment also set:

- **Required reviewers:** add yourself. Every production deploy then waits for your approval.
- **Prevent self-review:** leave this **unticked**. If you are the only reviewer and tick it, you can't approve your own releases.
- **Deployment branches and tags:** choose "Selected branches and tags", click **Add deployment branch or tag rule**, choose **Tag**, and enter `v*.*.*`. Only version tags can deploy to production.

### 5.3 Protect the `main` branch

Go to **Settings → Branches → Add branch protection rule** (or **Rules → Rulesets**). For branch `main`:

- Require a pull request before merging.
- Require status checks to pass, and add `verify` and `container`. GitHub shows them as "CI / verify" and "CI / container", and they only appear in the search box after CI has run at least once.

### 5.4 Things to know

- The staging deploy listens for "CI finished on `main`". GitHub only starts that kind of workflow (`workflow_run`) when the workflow file is already on the default branch. So staging deploys begin from the first CI run on `main` **after** `deploy-staging.yml` has been merged to `main`.
- Optional: you can set variables from the terminal with the GitHub CLI instead of the website, for example `gh variable set GCP_REGION --body asia-south1` or `gh variable set APP_ENV --env staging --body staging`.

---

## 6. First deploy and check

1. Make sure every variable from section 5 is set, with `GCP_PROJECT_ID` set last.
2. Follow the [first staging deploy steps](runbook.md#first-deploy-of-staging-the-app_base_url-chicken-and-egg) in the runbook. Staging needs its own web address in `APP_BASE_URL`, and that address is only known after the first deploy.
3. Open `<staging URL>/api/health`. It should show `"status":"ok"` and the deployed version.
4. Open `<staging URL>/api/ready`. It should show `"db":"ok"`. If it shows `"db":"down"`, see [runbook section 8](runbook.md#8-troubleshooting).
5. Tell the assistant that staging is live. Phase 2 is then complete.

From here on, the [runbook](runbook.md) covers releases to production, rollback and costs.
