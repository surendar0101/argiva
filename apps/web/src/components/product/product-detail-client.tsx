'use client';

import { generateCompositionLabel } from '@argiva/domain';
import { formatWeight, Price, PurityBadge } from '@argiva/ui';
import { useState } from 'react';
import { useCart } from '../cart/cart-context';
import type { ProductDetail } from '../../lib/catalog';
import { StickyMobileCta } from './sticky-mobile-cta';
import { VariantSelector } from './variant-selector';
import styles from './product-detail-client.module.css';

export function ProductDetailClient({ product }: { product: ProductDetail }) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? '');
  const { addItem, openDrawer } = useCart();
  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0];

  const composition = selectedVariant
    ? generateCompositionLabel({
        purity: selectedVariant.purity,
        purityVerified: selectedVariant.purityVerified,
        finish: selectedVariant.finish,
      })
    : null;
  const canAddToCart =
    selectedVariant !== undefined &&
    selectedVariant.pricePaise !== null &&
    selectedVariant.stockQuantity > 0;

  function addSelectedVariant() {
    if (!selectedVariant || selectedVariant.pricePaise === null || selectedVariant.stockQuantity <= 0) {
      return;
    }

    addItem({
      variantId: selectedVariant.id,
      productName: product.name,
      variantName: selectedVariant.name,
      pricePaise: selectedVariant.pricePaise,
      quantity: 1,
      imageUrl: '',
    });
    openDrawer();
  }

  return (
    <section className={styles.details} aria-label={`${product.name} details`}>
      {selectedVariant && composition && (
        <PurityBadge
          label={composition}
          tone={selectedVariant.purity === '92.5' && selectedVariant.purityVerified ? 'sterling' : 'alloy'}
        />
      )}
      <h1 className={styles.title}>{product.name}</h1>
      {selectedVariant && selectedVariant.pricePaise !== null ? (
        <p className={styles.price}><Price paise={selectedVariant.pricePaise} size="lg" /></p>
      ) : selectedVariant ? (
        <p className={styles.priceUnavailable} role="status">
          {selectedVariant.pricingMode === 'silver_rate'
            ? 'The current silver rate could not be confirmed. Please check back soon.'
            : 'Price unavailable'}
        </p>
      ) : null}

      {selectedVariant ? (
        <>
          <dl className={styles.facts}>
            <div><dt>Weight</dt><dd>{formatWeight(selectedVariant.weightGrams)}</dd></div>
            <div><dt>Finish</dt><dd>{selectedVariant.finish === 'rose_gold' ? 'Rose-gold finish' : selectedVariant.finish === 'oxidised' ? 'Oxidised' : 'Plain'}</dd></div>
            {selectedVariant.dimensions && (
              <div><dt>Size</dt><dd>{selectedVariant.dimensions}</dd></div>
            )}
            <div><dt>Availability</dt><dd>{selectedVariant.stockQuantity > 0 ? 'In stock' : 'Out of stock'}</dd></div>
            {selectedVariant.isPair && <div><dt>Sold as</dt><dd>Pair</dd></div>}
          </dl>
          <VariantSelector
            variants={product.variants}
            selectedVariantId={selectedVariant.id}
            onChange={setSelectedVariantId}
          />
        </>
      ) : (
        <p className={styles.priceUnavailable} role="status">
          No active variants are currently available.
        </p>
      )}

      <StickyMobileCta
        pricePaise={selectedVariant?.pricePaise ?? null}
        disabled={!canAddToCart}
        label={selectedVariant?.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        onAddToCart={addSelectedVariant}
      />
    </section>
  );
}
