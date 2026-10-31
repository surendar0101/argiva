# 0002. Email (mailboxes and transactional email)

- Status: Accepted
- Date: 2026-10-31
- Deciders: Owner (+ agent)

## Context
The business needs branded mailboxes for the family (support, owner) and automated emails (order confirmation, password reset, admin alerts) at near-zero cost.

## Options considered
- Mailboxes: Google Workspace (paid per user), Zoho Mail free/Lite, or forwarding only.
- Transactional email: Resend free tier, Amazon SES, or the mailbox provider's SMTP.

## Decision
- Mailboxes: Zoho Mail free or Lite, with SPF, DKIM and DMARC set up on Cloudflare DNS.
- Transactional email: Resend free tier, sent from a subdomain, behind an `EmailProvider` interface.

## Consequences
- Keeping mailbox and transactional sending on separate services protects the reputation of the main domain.
- Moving off Resend later means writing a new adapter, not changing the app.
- TODO(owner): which support address to publish.
