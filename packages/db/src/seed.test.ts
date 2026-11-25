import { describe, expect, it } from 'vitest';
import { initialSeedData, seedDatabase } from './seed';

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

  it('seeds only reference data', () => {
    expect(Object.keys(initialSeedData).sort()).toEqual(['categories', 'policies']);
  });

  it('contains no internal notes or unconfirmed seller claims', () => {
    const text = JSON.stringify(initialSeedData.policies);
    expect(text).not.toContain('TODO(owner)');
    expect(text).not.toMatch(/sole proprietorship|is the grievance officer|Bengaluru/i);
  });

  it('keeps the cancellation terms decided in Phase 0', () => {
    const text = JSON.stringify(initialSeedData.policies.find((p) => p.slug === 'cancellation'));
    expect(text).toContain('Orders may be cancelled without charge before dispatch.');
    expect(text).toContain('5–7 business days');
  });

  it('exports seedDatabase function', () => {
    expect(typeof seedDatabase).toBe('function');
  });
});
