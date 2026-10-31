# 0005. Payments and currency

- Status: Accepted
- Date: 2026-10-31
- Deciders: Owner (+ agent)

## Context
No cash on delivery. India sales come first. International sales are built now but stay switched off until GST, IEC, LUT and an international-card-enabled gateway are approved. The business is not yet GST-registered.

## Options considered
- Gateways: Razorpay, Cashfree, PayU, PhonePe PG, with PayPal for international.
- Currency: charge in the customer's currency, or show converted prices and always charge INR.

## Decision
- Razorpay for domestic and (later) international payments, behind a `PaymentProvider` interface. PayPal or Cashfree can be added later as adapters.
- Show converted prices using exchange rates cached daily (configurable), but **always charge INR**. Revisit if international sales exceed about 20%.
- International checkout sits behind a feature flag.

## Consequences
- Shown prices are approximate for foreign customers; the checkout must say the charge is in INR.
- Payments are confirmed by webhooks with signature checks, and the handlers can safely receive the same event twice.
- Refunds for cancellations go to the original payment method within 5–7 business days (see [0009](0009-legal-policy-pages.md)).
- TODO(owner): Razorpay account approval status.
