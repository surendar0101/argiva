import { describe, expect, it } from 'vitest';
import {
  calculateVariantPrice,
  createOrderPricingSnapshot,
  recalculateFromSnapshot,
} from './pricing';

describe('Pricing Engine & Snapshots (ADR 0007 & Brand Content §10)', () => {
  describe('Fixed Pricing Mode', () => {
    it('returns fixed price in integer paise', () => {
      const result = calculateVariantPrice({
        pricingMode: 'fixed',
        fixedPricePaise: 299900, // ₹2,999.00
        makingChargesPaise: 0,
        weightGrams: 15.0,
        purity: '92.5',
        purityVerified: true,
      });

      expect(result.finalPricePaise).toBe(299900);
      expect(result.pricingMode).toBe('fixed');
      expect(Number.isInteger(result.finalPricePaise)).toBe(true);
    });

    it('throws error if fixed price is missing or non-positive', () => {
      expect(() =>
        calculateVariantPrice({
          pricingMode: 'fixed',
          fixedPricePaise: 0,
          makingChargesPaise: 0,
          weightGrams: 10,
          purity: '92.5',
          purityVerified: true,
        }),
      ).toThrowError(/fixed price/i);
    });
  });

  describe('Silver-Rate-Based Pricing Mode', () => {
    it('calculates 92.5% silver item price using spot rate, purity factor, and making charges', () => {
      // 10.0g silver, rate = 10000 paise/g (₹100/g), 92.5% purity (0.925)
      // Metal cost = 10.0 * 10000 * 0.925 = 92500 paise (₹925.00)
      // Making charges = 35000 paise (₹350.00)
      // Total = 127500 paise (₹1,275.00)
      const result = calculateVariantPrice(
        {
          pricingMode: 'silver_rate',
          weightGrams: 10.0,
          purity: '92.5',
          purityVerified: true,
          makingChargesPaise: 35000,
        },
        { ratePerGramPaise: 10000 },
      );

      expect(result.finalPricePaise).toBe(127500);
      expect(result.breakdown.metalCostPaise).toBe(92500);
      expect(result.breakdown.makingChargesPaise).toBe(35000);
      expect(Number.isInteger(result.finalPricePaise)).toBe(true);
    });

    it('calculates 80% silver item price correctly', () => {
      // 20.0g silver, rate = 9500 paise/g, 80% purity (0.80)
      // Metal cost = 20.0 * 9500 * 0.80 = 152000 paise
      // Making charges = 40000 paise
      // Total = 192000 paise
      const result = calculateVariantPrice(
        {
          pricingMode: 'silver_rate',
          weightGrams: 20.0,
          purity: '80',
          purityVerified: true,
          makingChargesPaise: 40000,
        },
        { ratePerGramPaise: 9500 },
      );

      expect(result.finalPricePaise).toBe(192000);
      expect(result.breakdown.metalCostPaise).toBe(152000);
    });

    it('calculates 60% silver item price correctly', () => {
      // 5.5g silver, rate = 10000 paise/g, 60% purity (0.60)
      // Metal cost = round(5.5 * 10000 * 0.60) = 33000 paise
      // Making charges = 20000 paise
      // Total = 53000 paise
      const result = calculateVariantPrice(
        {
          pricingMode: 'silver_rate',
          weightGrams: 5.5,
          purity: '60',
          purityVerified: true,
          makingChargesPaise: 20000,
        },
        { ratePerGramPaise: 10000 },
      );

      expect(result.finalPricePaise).toBe(53000);
      expect(result.breakdown.metalCostPaise).toBe(33000);
    });

    it('throws error if rate-based pricing is evaluated without an active silver rate', () => {
      expect(() =>
        calculateVariantPrice({
          pricingMode: 'silver_rate',
          weightGrams: 10.0,
          purity: '92.5',
          purityVerified: true,
          makingChargesPaise: 20000,
        }),
      ).toThrowError(/silver rate is required/i);
    });
  });

  describe('Order Price Snapshots & Historical Invariance (ADR 0007 / Review Focus 1)', () => {
    it('creates an immutable snapshot with all pricing inputs recorded', () => {
      const snapshot = createOrderPricingSnapshot(
        {
          pricingMode: 'silver_rate',
          weightGrams: 12.0,
          purity: '92.5',
          purityVerified: true,
          makingChargesPaise: 50000,
        },
        { ratePerGramPaise: 10000 },
      );

      expect(snapshot.formulaVersion).toBe('v1');
      expect(snapshot.pricingMode).toBe('silver_rate');
      expect(snapshot.weightGrams).toBe(12.0);
      expect(snapshot.purity).toBe('92.5');
      expect(snapshot.baseRatePerGramPaise).toBe(10000);
      expect(snapshot.makingChargesPaise).toBe(50000);
      expect(snapshot.calculatedPricePaise).toBe(161000);
    });

    it('guarantees that subsequent silver rate increases do not change the historical order snapshot', () => {
      // Order placed today when silver is ₹95/g (9500 paise/g)
      const initialRate = { ratePerGramPaise: 9500 };
      const variant = {
        pricingMode: 'silver_rate' as const,
        weightGrams: 10.0,
        purity: '92.5' as const,
        purityVerified: true,
        makingChargesPaise: 30000,
      };

      const orderSnapshot = createOrderPricingSnapshot(variant, initialRate);
      const snapshotInitialPrice = orderSnapshot.calculatedPricePaise;
      expect(snapshotInitialPrice).toBe(117875);

      // Tomorrow silver price increases to ₹150/g (15000 paise/g)
      const newRate = { ratePerGramPaise: 15000 };
      const currentLivePrice = calculateVariantPrice(variant, newRate);
      expect(currentLivePrice.finalPricePaise).toBe(168750); // Live price increased

      // The historical snapshot remains exactly what was charged at order time
      expect(orderSnapshot.calculatedPricePaise).toBe(snapshotInitialPrice);
      expect(orderSnapshot.baseRatePerGramPaise).toBe(9500);

      // Verify that recalculating from the snapshot produces the frozen order price, not the current live rate
      const historicalVerified = recalculateFromSnapshot(orderSnapshot);
      expect(historicalVerified).toBe(snapshotInitialPrice);
    });
  });
});
