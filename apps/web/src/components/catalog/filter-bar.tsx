'use client';

import styles from './filter-bar.module.css';
import type { CatalogFilters } from '../../lib/catalog';

interface FilterBarProps {
  filters: {
    purities: readonly NonNullable<CatalogFilters['purity']>[];
    finishes: readonly NonNullable<CatalogFilters['finish']>[];
    priceRange?: { minPaise: number; maxPaise: number };
  };
  activeFilters: CatalogFilters;
  onFilterChange: (filters: CatalogFilters) => void;
}

const FINISH_LABELS: Record<NonNullable<CatalogFilters['finish']>, string> = {
  plain: 'Plain',
  oxidised: 'Oxidised',
  rose_gold: 'Rose Gold',
};

export function FilterBar({ filters, activeFilters, onFilterChange }: FilterBarProps) {
  const hasActiveFilters = Object.values(activeFilters).some((value) => value !== undefined);

  function toggleFilter<K extends 'purity' | 'finish'>(
    key: K,
    value: NonNullable<CatalogFilters[K]>,
    isActive: boolean,
  ) {
    const nextFilters = { ...activeFilters };
    if (isActive) {
      delete nextFilters[key];
    } else {
      nextFilters[key] = value;
    }
    onFilterChange(nextFilters);
  }

  function updatePriceFilter(key: 'minPricePaise' | 'maxPricePaise', value: string) {
    const nextFilters = { ...activeFilters };
    if (value === '') {
      delete nextFilters[key];
    } else {
      const paise = Math.round(Number(value) * 100);
      if (!Number.isFinite(paise)) return;
      nextFilters[key] = paise;
    }
    onFilterChange(nextFilters);
  }

  return (
    <div className={styles.bar} role="toolbar" aria-label="Product filters">
      {filters.purities.length > 0 && (
        <div className={styles.group}>
          <span className={styles.label}>Purity</span>
          <div className={styles.options}>
            {filters.purities.map((purity) => {
              const isActive = activeFilters.purity === purity;
              return (
                <button
                  key={purity}
                  className={styles.chip}
                  aria-pressed={isActive}
                  onClick={() => toggleFilter('purity', purity, isActive)}
                >
                  {purity}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {filters.finishes.length > 0 && (
        <div className={styles.group}>
          <span className={styles.label}>Finish</span>
          <div className={styles.options}>
            {filters.finishes.map((finish) => {
              const isActive = activeFilters.finish === finish;
              return (
                <button
                  key={finish}
                  className={styles.chip}
                  aria-pressed={isActive}
                  onClick={() => toggleFilter('finish', finish, isActive)}
                >
                  {FINISH_LABELS[finish] ?? finish}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {filters.priceRange && (
        <div className={styles.priceGroup} role="group" aria-label="Price range in rupees">
          <label className={styles.priceField}>
            Minimum price (₹)
            <input
              type="number"
              min={filters.priceRange.minPaise / 100}
              max={filters.priceRange.maxPaise / 100}
              step="0.01"
              value={activeFilters.minPricePaise === undefined ? '' : activeFilters.minPricePaise / 100}
              onChange={(event) => updatePriceFilter('minPricePaise', event.target.value)}
            />
          </label>
          <label className={styles.priceField}>
            Maximum price (₹)
            <input
              type="number"
              min={filters.priceRange.minPaise / 100}
              max={filters.priceRange.maxPaise / 100}
              step="0.01"
              value={activeFilters.maxPricePaise === undefined ? '' : activeFilters.maxPricePaise / 100}
              onChange={(event) => updatePriceFilter('maxPricePaise', event.target.value)}
            />
          </label>
        </div>
      )}

      {hasActiveFilters && (
        <button
          className={styles.clear}
          onClick={() => onFilterChange({})}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
