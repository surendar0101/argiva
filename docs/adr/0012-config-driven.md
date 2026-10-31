# 0012. Configuration-driven, no hard-coded business values

- Status: Accepted
- Date: 2026-10-31
- Deciders: Owner (+ agent)

## Context
Domains, contact details, fees, tax wording, feature flags and providers will change as the business registers for GST, picks a shipping aggregator and opens international sales. The owner asked for "no hardcoded URLs/domains — centralised typed config/constants/models".

## Options considered
- Scattered environment variables read wherever they are needed.
- One typed config module validated with Zod at startup, plus admin-editable site settings in the database.

## Decision
- **Deployment config** (URLs, regions, provider keys) comes from environment variables. One `config` package parses them with Zod and the app refuses to start on invalid values. Only `.env.example` is committed, never secrets.
- **Business settings** live in a `site_settings` table and are edited in the admin, with an audit log. These include contact details, the shipping fee, the GST wording toggle, feature flags (international) and the active theme.
- Shared constants and domain types live in packages, never inline.

## Consequences
- A lint rule and code review reject hard-coded domains, prices or contact details.
- Unknown facts stay as `TODO(owner)` placeholders in settings and are never guessed.
