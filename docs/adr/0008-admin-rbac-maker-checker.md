# 0008. Admin roles, permissions and maker-checker

- Status: Accepted
- Date: 2026-10-31
- Deciders: Owner (+ agent)

## Context
4–10 admin users (the owner, family and staff), using phones and desktops equally. Price mistakes cost money, so sensitive changes need a second pair of eyes.

## Options considered
- Fixed roles hard-coded in route handlers. Rejected: it spreads permission checks through the code and makes them hard to audit.
- A permission matrix (module × action) attached to roles and checked by one central guard.

## Decision
- Roles: Owner, Manager, Catalog Editor, Fulfilment, Support.
- Permissions follow the approved matrix in [sdd/phase-0-discovery.md §0.6](../../sdd/phase-0-discovery.md).
- **Maker-checker:** a different Owner or Manager must approve silver-rate and price changes. An Owner may approve their own change only with a mandatory reason, and the audit log flags it.
- Products and policy pages go Draft → Publish.
- Security:
  - 2FA for Owner and Manager.
  - Sign-out after 30 minutes idle.
  - An email alert on login from a new device.
  - A full audit log of all admin actions.
- Theme switching (Admin > Appearance) is Owner-only (`settings.appearance`); see [0011](0011-design-direction-themes.md).
- Notifications: browser or phone push plus email on each new order. WhatsApp Business API alerts are deferred because of their per-message cost.

## Consequences
- Every server action and API route calls one central permission guard, and tests cover the whole matrix.
- The audit log can only be added to, never edited, and only the Owner can see it in full; Managers see it read-only.
