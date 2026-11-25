import type { PurityGrade } from './composition';

export type PricingMode = 'fixed' | 'silver_rate';

export interface VariantPricingInput {
  pricingMode: PricingMode;
  fixedPricePaise?: number | null | undefined;
  makingChargesPaise?: number | undefined;
  weightGrams: number;
  purity: PurityGrade;
  purityVerified: boolean;
}

export interface SilverRateInput {
  ratePerGramPaise: number;
}

export interface PricingBreakdown {
  metalCostPaise?: number | undefined;
  makingChargesPaise?: number | undefined;
  fixedPricePaise?: number | undefined;
}

export interface VariantPriceResult {
  finalPricePaise: number;
  pricingMode: PricingMode;
  breakdown: PricingBreakdown;
  formulaVersion: string;
}

export interface OrderPricingSnapshot {
  pricingMode: PricingMode;
  formulaVersion: string;
  weightGrams: number;
  purity: PurityGrade;
  purityVerified: boolean;
  baseRatePerGramPaise?: number | undefined;
  makingChargesPaise?: number | undefined;
  calculatedPricePaise: number;
}

const PURITY_FACTORS: Record<PurityGrade, number> = {
  '92.5': 0.925,
  '80': 0.8,
  '60': 0.6,
  'other': 0.5,
};

export const CURRENT_FORMULA_VERSION = 'v1';

/**
 * Calculates selling price for a product variant in integer paise.
 * In silver_rate mode, calculates:
 *   metalCost = round(weightGrams * ratePerGramPaise * purityFactor)
 *   finalPrice = metalCost + makingChargesPaise
 */
export function calculateVariantPrice(
  variant: VariantPricingInput,
  silverRate?: SilverRateInput,
  formulaVersion: string = CURRENT_FORMULA_VERSION,
): VariantPriceResult {
  if (variant.pricingMode === 'fixed') {
    const fixed = variant.fixedPricePaise;
    if (!fixed || fixed <= 0 || !Number.isInteger(fixed)) {
      throw new Error('A valid positive integer fixed price in paise is required for fixed pricing mode');
    }
    return {
      finalPricePaise: fixed,
      pricingMode: 'fixed',
      breakdown: { fixedPricePaise: fixed },
      formulaVersion,
    };
  }

  if (variant.pricingMode === 'silver_rate') {
    if (!silverRate || !silverRate.ratePerGramPaise || silverRate.ratePerGramPaise <= 0) {
      throw new Error('An active silver rate is required for silver-rate-based pricing');
    }

    const factor = PURITY_FACTORS[variant.purity] ?? 0.5;
    const metalCostPaise = Math.round(variant.weightGrams * silverRate.ratePerGramPaise * factor);
    const makingChargesPaise = variant.makingChargesPaise ?? 0;
    const finalPricePaise = metalCostPaise + makingChargesPaise;

    return {
      finalPricePaise,
      pricingMode: 'silver_rate',
      breakdown: {
        metalCostPaise,
        makingChargesPaise,
      },
      formulaVersion,
    };
  }

  throw new Error(`Unsupported pricing mode: ${String(variant.pricingMode)}`);
}

/**
 * Captures an immutable pricing snapshot at the moment an order is created.
 * ADR 0007: Later rate changes must never alter existing orders.
 */
export function createOrderPricingSnapshot(
  variant: VariantPricingInput,
  silverRate?: SilverRateInput,
  formulaVersion: string = CURRENT_FORMULA_VERSION,
): OrderPricingSnapshot {
  const calculation = calculateVariantPrice(variant, silverRate, formulaVersion);

  return {
    pricingMode: variant.pricingMode,
    formulaVersion,
    weightGrams: variant.weightGrams,
    purity: variant.purity,
    purityVerified: variant.purityVerified,
    baseRatePerGramPaise: silverRate?.ratePerGramPaise,
    makingChargesPaise: variant.makingChargesPaise ?? 0,
    calculatedPricePaise: calculation.finalPricePaise,
  };
}

/**
 * Verifies or recalculates the historic unit price from a frozen order snapshot.
 * Guarantees that the historical rate and inputs produce the exact frozen price.
 */
export function recalculateFromSnapshot(snapshot: OrderPricingSnapshot): number {
  if (snapshot.pricingMode === 'fixed') {
    return snapshot.calculatedPricePaise;
  }

  if (snapshot.pricingMode === 'silver_rate' && snapshot.baseRatePerGramPaise) {
    const factor = PURITY_FACTORS[snapshot.purity] ?? 0.5;
    const metalCostPaise = Math.round(snapshot.weightGrams * snapshot.baseRatePerGramPaise * factor);
    return metalCostPaise + (snapshot.makingChargesPaise ?? 0);
  }

  return snapshot.calculatedPricePaise;
}
