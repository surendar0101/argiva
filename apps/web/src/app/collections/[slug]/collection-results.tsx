'use client';

import { useState } from 'react';
import { generateCompositionLabel } from '@argiva/domain';
import { ProductCard } from '@argiva/ui';
import { FilterBar } from '../../../components/catalog/filter-bar';
import type { CatalogFilters, CatalogProduct } from '../../../lib/catalog';
import styles from './collection-results.module.css';

function getFinishLabel(finish: CatalogProduct['finish']): string {
  return finish === 'rose_gold' ? 'Rose Gold' : finish === 'oxidised' ? 'Oxidised' : 'Plain';
}

export function CollectionResults({ products }: { products: CatalogProduct[] }) {
  const [activeFilters, setActiveFilters] = useState<CatalogFilters>({});

  if (products.length === 0) {
    return <p className={styles.empty}>There are no products in this collection yet.</p>;
  }

  const purities = [...new Set(products.map((product) => product.purity))];
  const finishes = [...new Set(products.map((product) => product.finish))];
  const prices = products.flatMap((product) => (product.pricePaise === null ? [] : [product.pricePaise]));
  const availableFilters = {
    purities,
    finishes,
    ...(prices.length > 0
      ? { priceRange: { minPaise: Math.min(...prices), maxPaise: Math.max(...prices) } }
      : {}),
  };
  const visibleProducts = products.filter((product) => {
    if (activeFilters.purity && product.purity !== activeFilters.purity) return false;
    if (activeFilters.finish && product.finish !== activeFilters.finish) return false;
    const { minPricePaise, maxPricePaise } = activeFilters;
    const price = product.pricePaise;
    if (minPricePaise !== undefined && (price === null || price < minPricePaise)) return false;
    if (maxPricePaise !== undefined && (price === null || price > maxPricePaise)) return false;
    return true;
  });

  return (
    <section className={styles.results} aria-label="Collection products">
      <FilterBar
        filters={availableFilters}
        activeFilters={activeFilters}
        onFilterChange={(filters) => setActiveFilters(filters)}
      />
      {visibleProducts.length === 0 ? (
        <p className={styles.empty} role="status">No products match these filters.</p>
      ) : (
        <ul className={styles.grid}>
          {visibleProducts.map((product) => (
            <li key={product.id}>
              <ProductCard
                href={`/products/${product.slug}`}
                name={product.name}
                pricePaise={product.pricePaise}
                weightGrams={product.weightGrams}
                finish={getFinishLabel(product.finish)}
                purity={{
                  label: generateCompositionLabel({
                    purity: product.purity,
                    purityVerified: product.purityVerified,
                    finish: product.finish,
                  }),
                  tone: product.purity === '92.5' && product.purityVerified ? 'sterling' : 'alloy',
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
