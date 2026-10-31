# 0001. Domain, registrar and DNS

- Status: Accepted
- Date: 2026-10-31
- Deciders: Owner (+ agent)

## Context
ARGIVA has no domain yet. Customers are in India first and international later. The infrastructure budget is under ₹1000 a month.

## Options considered
- Registrars: GoDaddy, BigRock, Cloudflare Registrar. Cloudflare sells at cost, but its .in support was a concern. GoDaddy and BigRock are familiar to the owner.
- DNS: the registrar's own DNS, or Cloudflare free DNS with its CDN.

## Decision
- Primary domain `argivasilvers.com`. `argivasilvers.in` redirects to it.
- Registrar: GoDaddy or BigRock, at the owner's choice.
- Nameservers move to Cloudflare (free) for DNS, CDN, TLS and caching.

## Consequences
- Watch renewal prices; first-year discounts often hide higher renewal fees.
- Cloudflare sits in front of every environment, and its cached catalog pages hide Cloud Run cold starts (see [0003](0003-cloud-hosting.md)).
- Domains live only in config, never in code (see [0012](0012-config-driven.md)).
- TODO(owner): trademark search on IP India, class 14, before buying the domain.
