# 0009. Legal and policy pages

- Status: Accepted
- Date: 2026-10-31
- Deciders: Owner (+ agent)

## Context
An Indian online seller needs terms, a privacy policy under the DPDP Act 2023, seller and grievance details, and clear shipping, return and refund rules. Some policies in [docs/brand-content.md](../brand-content.md) are marked *proposed*.

## Options considered
- Generic policy templates. Rejected: they would invent facts.
- Pages generated from brand-content text plus facts the owner confirms, published only after approval.

## Decision
- Pages:
  - Terms & Conditions.
  - Privacy Policy (DPDP Act 2023).
  - Cookie notice.
  - Shipping & Delivery.
  - Returns & Damaged Products.
  - Cancellation & Refunds.
  - Care & Re-polishing.
  - Contact, with seller and grievance officer details.
- Entity: sole proprietorship. The owner is the grievance officer. Jurisdiction: Bengaluru courts.
- Cancellation: free before dispatch, not possible after. Refunds go to the original payment method within 5–7 business days, which also applies to failed or duplicate payments. This is separate from the damage-claim policy, which offers no cash refunds.
- Shipping: an aggregator (Shiprocket or Delhivery One) with tracking. A flat domestic fee. Dispatch time is set per product.
- Contact channels: phone, email, a WhatsApp click-to-chat button, and Instagram.
- Every policy page ships as a **draft** until the owner approves it; a legal review is recommended.

## Consequences
- Policy content lives in the database (Draft → Publish), not in code.
- TODO(owner): legal name, address, grievance officer contact, the flat shipping fee and the choice of aggregator.
