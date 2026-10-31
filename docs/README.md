# argiva documentation

Start here to find any document in the project. When a new document is added, list it here too.

## Getting started

| Document | Read it when |
| --- | --- |
| [Project README](../README.md) | You want to know what's in the repo and how to start the site locally |
| [Setup guide](setup.md) | You're doing the one-time setup: tools, GitHub, Google Cloud, Neon, GitHub settings |
| [Runbook](runbook.md) | Day-to-day work: local development, configuration, deploying, rollback, troubleshooting, costs |

## Product and design

| Document | What it covers |
| --- | --- |
| [PRODUCT.md](../PRODUCT.md) | Who the site is for, and what it must do |
| [DESIGN.md](../DESIGN.md) | The design system: tokens, type, colour, motion, themes |
| [Imagery rules](design/imagery.md) | How product photos are shot, cropped and shown |
| [Brand content](brand-content.md) | All site copy and policies (the source of truth) |

## Decisions and plans

| Document | What it covers |
| --- | --- |
| [Decision summary](decisions.md) | One-line summary of every decision so far |
| [ADR index](adr/README.md) | Architecture Decision Records: one file per decision, with context and options |
| [Build roadmap](plans/README.md) | All phases, what each delivers, and what each needs from the owner |
| [Phase 1 plan: design system](plans/2026-10-31-phase-1-design-system.md) | Task-by-task plan for Phase 1 |
| [Phase 2 plan: foundations](plans/2026-10-31-phase-2-foundations.md) | Task-by-task plan for Phase 2 |

### Architecture Decision Records

| # | Decision |
| --- | --- |
| [0001](adr/0001-domain-registrar-dns.md) | Domain, registrar and DNS |
| [0002](adr/0002-email.md) | Email |
| [0003](adr/0003-cloud-hosting.md) | Cloud hosting |
| [0004](adr/0004-tech-stack.md) | Tech stack |
| [0005](adr/0005-payments-currency.md) | Payments and currency |
| [0006](adr/0006-catalog-variant-model.md) | Catalog and variant model |
| [0007](adr/0007-pricing-modes-order-snapshot.md) | Pricing modes and order price snapshot |
| [0008](adr/0008-admin-rbac-maker-checker.md) | Admin roles and maker-checker approval |
| [0009](adr/0009-legal-policy-pages.md) | Legal and policy pages |
| [0010](adr/0010-design-tooling.md) | Design tooling |
| [0011](adr/0011-design-direction-themes.md) | Design direction and themes |
| [0012](adr/0012-config-driven.md) | Config-driven code (no hard-coded values) |

## Apps and packages

| README | What it is |
| --- | --- |
| [apps/web](../apps/web/README.md) | The website (Next.js) |
| [apps/ui-preview](../apps/ui-preview/README.md) | Preview page for the design system |
| [packages/ui](../packages/ui/README.md) | Shared React components, themes and fonts |
| [packages/design-tokens](../packages/design-tokens/README.md) | Colours, type and spacing for each theme |
| [packages/config](../packages/config/README.md) | Typed settings (the only code that reads environment variables) |

## Project state (for the build assistant)

| File | What it is |
| --- | --- |
| [AGENTS.md](../AGENTS.md) | Instructions for AI coding assistants working in this repo |
| [sdd/state.json](../sdd/state.json) | Current phase and step, decisions, open questions for the owner |
| `sdd/*.md` | Progress log for each phase |
