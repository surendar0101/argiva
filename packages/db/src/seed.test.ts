import { describe, expect, it } from 'vitest';
import { initialSeedData, seedDatabase } from './seed';
import { generateCompositionLabel, calculateVariantPrice } from '@argiva/domain';

describe('Database Seed Data & Domain Integration', () => {
  it('contains all 6 brand categories from brand content §4', () => {
    const slugs = initialSeedData.categories.map((c) => c.slug);
    expect(slugs).toContain('chains-and-pendants');
    expect(slugs).toContain('earrings');
    expect(slugs).toContain('bangles-and-bracelets');
    expect(slugs).toContain('anklets');
    expect(slugs).toContain('rings');
    expect(slugs).toContain('silver-gifting');
  });

  it('guarantees seeded anklets are sold as pairs per brand content §5', () => {
    const ankletVariants = initialSeedData.variants.filter((v) => v.sku.startsWith('ANK-'));
    expect(ankletVariants.length).toBeGreaterThan(0);
    for (const v of ankletVariants) {
      expect(v.isPair).toBe(true);
    }
  });

  it('seeds all eight policy documents as drafts', () => {
    expect(initialSeedData.policies.map((policy) => policy.slug)).toEqual([
      'terms',
      'privacy',
      'shipping',
      'returns',
      'cancellation',
      'care',
      'cookies',
      'contact-disclosures',
    ]);
    expect(initialSeedData.policies.every((policy) => policy.status === 'draft')).toBe(true);
  });

  it('generates valid composition labels and pricing for all seeded variants', () => {
    const silverRate = initialSeedData.silverRate;

    for (const variant of initialSeedData.variants) {
      // 1. Verify composition label works
      const label = generateCompositionLabel({
        purity: variant.purity,
        purityVerified: Boolean(variant.purityVerified),
        finish: variant.finish,
      });
      expect(label).toBeTruthy();

      // 2. Verify pricing calculates cleanly in paise
      const priceResult = calculateVariantPrice(
        {
          pricingMode: variant.pricingMode,
          fixedPricePaise: variant.fixedPricePaise,
          makingChargesPaise: variant.makingChargesPaise,
          weightGrams: Number(variant.weightGrams),
          purity: variant.purity,
          purityVerified: Boolean(variant.purityVerified),
        },
        silverRate,
      );

      expect(priceResult.finalPricePaise).toBeGreaterThan(0);
      expect(Number.isInteger(priceResult.finalPricePaise)).toBe(true);
    }
  });

  it('exports seedDatabase function', () => {
    expect(typeof seedDatabase).toBe('function');
  });
});
