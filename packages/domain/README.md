# @argiva/domain

Pure business logic package for ARGIVA e-commerce operations. Has zero database dependencies and executes in any JavaScript/TypeScript runtime.

## Modules

### 1. Composition Labelling (`composition.ts`)
Implements strict silver jewellery naming rules from Brand Content §5:
- **92.5%:** Described as "925 sterling silver" only when purity is verified. Unverified silver is labelled "92.5% silver (unverified)".
- **80% and 60%:** States verified silver content and notes remainder is other metals; never labelled as 925 sterling silver.
- **Finishes:** Correctly qualifies finishes (e.g. "with rose-gold finish") without implying solid gold.
- **Purity Badges:** Issues hallmark badges (`925`, `800`, `600`) only with verified certification.

### 2. Pricing Engine (`pricing.ts`)
Implements flexible pricing rules (ADR 0007 & Brand Content §10):
- **Fixed Pricing:** Validates positive integer paise prices.
- **Silver-Rate-Based Pricing:** Computes spot metal cost from gram weight, current approved benchmark rate, and purity multiplier (0.925, 0.80, 0.60), combined with making charges in integer paise.
- **Order Pricing Snapshots:** Freezes full pricing inputs (mode, weight, purity, rate, charges, formula version, calculated price) onto order lines at purchase time. Ensures later spot rate revisions never alter historical order amounts.
- **Snapshot Recalculation:** Verifies invoice reproduction against original purchase inputs.

### 3. Inventory Reservations (`reservation.ts`)
Manages stock holds:
- **Reservation Creation:** Allocates stock with TTL (default 15 minutes).
- **Active Status Check:** Evaluates whether a hold is within its TTL.
- **Available Stock:** Computes available inventory by subtracting only active holds from total stock, releasing expired holds back to availability.

## Scripts

```bash
# Typecheck
pnpm --filter @argiva/domain typecheck

# Run unit tests
pnpm --filter @argiva/domain test
```
