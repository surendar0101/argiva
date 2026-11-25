import { describe, expect, it } from 'vitest';
import { generateCompositionLabel, getPurityBadge } from './composition';

describe('Silver Composition Labelling (Brand Content §5)', () => {
  describe('92.5% Silver', () => {
    it('describes as "925 sterling silver" only when verified', () => {
      const label = generateCompositionLabel({
        purity: '92.5',
        purityVerified: true,
        finish: 'plain',
      });
      expect(label).toBe('925 sterling silver');
    });

    it('adds finish description for oxidised finish', () => {
      const label = generateCompositionLabel({
        purity: '92.5',
        purityVerified: true,
        finish: 'oxidised',
      });
      expect(label).toBe('925 sterling silver with oxidised finish');
    });

    it('describes underlying metal and finish without implying solid rose gold', () => {
      const label = generateCompositionLabel({
        purity: '92.5',
        purityVerified: true,
        finish: 'rose_gold',
      });
      expect(label).toBe('925 sterling silver with rose-gold finish');
      expect(label.toLowerCase()).not.toContain('solid rose gold');
    });

    it('strictly forbids "925 sterling silver" label if composition is unverified', () => {
      const label = generateCompositionLabel({
        purity: '92.5',
        purityVerified: false,
        finish: 'plain',
      });
      expect(label).toBe('92.5% silver (unverified)');
      expect(label).not.toContain('925 sterling silver');
    });
  });

  describe('80% and 60% Silver', () => {
    it('states verified silver content and notes remainder is other metals for 80%', () => {
      const label = generateCompositionLabel({
        purity: '80',
        purityVerified: true,
        finish: 'plain',
      });
      expect(label).toBe('80% silver with other metals');
      expect(label).not.toContain('925');
      expect(label).not.toContain('sterling');
    });

    it('states verified silver content and notes remainder is other metals for 60%', () => {
      const label = generateCompositionLabel({
        purity: '60',
        purityVerified: true,
        finish: 'plain',
      });
      expect(label).toBe('60% silver with other metals');
      expect(label).not.toContain('925');
      expect(label).not.toContain('sterling');
    });

    it('appends finish for 80% silver with rose_gold without implying solid gold', () => {
      const label = generateCompositionLabel({
        purity: '80',
        purityVerified: true,
        finish: 'rose_gold',
      });
      expect(label).toBe('80% silver with other metals (rose-gold finish)');
    });

    it('does not present an unverified 80% value as confirmed composition', () => {
      expect(
        generateCompositionLabel({
          purity: '80',
          purityVerified: false,
          finish: 'plain',
        }),
      ).toBe('Silver composition unverified');
    });

    it('keeps the finish visible without claiming unverified 60% composition', () => {
      expect(
        generateCompositionLabel({
          purity: '60',
          purityVerified: false,
          finish: 'rose_gold',
        }),
      ).toBe('Silver composition unverified (rose-gold finish)');
    });
  });

  describe('Purity Badges', () => {
    it('returns "925" badge only for verified 92.5% silver', () => {
      expect(getPurityBadge('92.5', true)).toBe('925');
      expect(getPurityBadge('92.5', false)).toBeNull();
    });

    it('returns "800" badge for verified 80% silver', () => {
      expect(getPurityBadge('80', true)).toBe('800');
      expect(getPurityBadge('80', false)).toBeNull();
    });

    it('returns "600" badge for verified 60% silver', () => {
      expect(getPurityBadge('60', true)).toBe('600');
      expect(getPurityBadge('60', false)).toBeNull();
    });
  });
});
