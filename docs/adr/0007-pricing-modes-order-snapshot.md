# 0007. Pricing modes and order price snapshot

- Status: Accepted
- Date: 2026-10-31
- Deciders: Owner (+ agent)

## Context
Some items have fixed prices. Others follow a manually updated silver rate. Brand content §10 says: "When an order is placed, persist the final agreed price and all pricing inputs with the order. Later rate changes must never alter existing orders."

## Options considered
- Look up the price live from the product when an order is viewed. Rejected: history would change whenever the rate changed.
- Store only the final price. Rejected: not enough to audit or recreate an invoice.
- Store the final price **and** every pricing input on each order line.

## Decision
- Two pricing modes per variant: **fixed** or **silver-rate-based**.
- Inputs for rate-based prices: silver weight, purity grade, making charges, other metals, finishing, wastage, taxes and margin. The formula may differ by purity grade and is versioned.
- Each order line stores the final unit price, the mode, the rate and every input used, plus the formula version.
- Rate and price changes go through maker-checker approval (see [0008](0008-admin-rbac-maker-checker.md)).
- Money is stored as integer paise; never as floating point.

## Consequences
- Invoices and refunds always use the snapshot, never the current price.
- TODO(owner): the pricing formula per purity grade, GST treatment and rounding rule.
