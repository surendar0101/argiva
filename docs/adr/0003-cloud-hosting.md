# 0003. Cloud hosting and environments

- Status: Accepted
- Date: 2026-10-31
- Deciders: Owner (+ agent)

## Context
The owner asked for hosting that is **free when idle**, pay-per-use, under ₹1000 a month, simple now, and movable to bigger infrastructure later without rewrites. Data should stay in India where providers offer it (DPDP Act 2023).

## Options considered
- **DigitalOcean App Platform, Bangalore** (about ₹500–1500 a month, always on). The first proposal, rejected because it is not free when idle.
- **Vercel Hobby or Pro.** Hobby forbids commercial use. Pro costs about ₹1700 a month and ties us to the platform's runtime.
- **Cloudflare Workers/Pages.** Cheapest, but the most runtime lock-in.
- **Self-managed VPS (Hetzner, DigitalOcean).** Cheap, but we would have to patch and run servers ourselves.
- **Google Cloud Run, asia-south1.** Docker, scales to zero, generous free tier.

## Decision
- App: Google Cloud Run, Mumbai (`asia-south1`), one Docker image, scale to zero.
- Database: Neon Postgres free tier (suspends when idle). Media: Cloudflare R2 (S3 API, no egress fees). DNS and CDN: Cloudflare free.
- Also on free tiers: Resend (email), PostHog (analytics), Sentry (errors). Scheduled jobs run on GitHub Actions or Cloud Scheduler. No Redis.
- Environments:
  - Local: Docker Compose.
  - Staging: a second Cloud Run service plus a Neon branch, deployed automatically from `main`.
  - Production: deployed on a release tag.
- Backups: the provider's own backups plus a weekly `pg_dump` to R2 via GitHub Actions. Budget alert at ₹500 on Google Cloud.
- No infrastructure-as-code yet. The repo holds the Dockerfile, the Compose file, the service config and a runbook; Terraform comes later.

## Consequences
- After idle periods the first request takes 1–3 s (cold start). Cloudflare-cached catalog pages hide most of this.
- Google Cloud needs a payment card on file.
- Portable by design: a Docker image, plain Postgres and the S3 API can move to AWS, Azure or Kubernetes without code changes.
- Neon's nearest region may be outside India. The region is set in config, and the privacy policy discloses where data is stored.
