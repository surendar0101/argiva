import { formatInr, formatWeight } from '@argiva/ui';
import { generateCompositionLabel } from '@argiva/domain';
import type { ProductDetail } from '../../lib/catalog';
import styles from './variant-selector.module.css';

type Variant = ProductDetail['variants'][number];

interface VariantSelectorProps {
  variants: ProductDetail['variants'];
  selectedVariantId: string;
  onChange: (variantId: string) => void;
}

function finishLabel(finish: Variant['finish']): string {
  switch (finish) {
    case 'plain':
      return 'Plain';
    case 'oxidised':
      return 'Oxidised';
    case 'rose_gold':
      return 'Rose-gold finish';
  }
}

export function VariantSelector({ variants, selectedVariantId, onChange }: VariantSelectorProps) {
  if (variants.length === 0) {
    return null;
  }

  return (
    <fieldset className={styles.selector}>
      <legend>Choose a variant</legend>
      <div className={styles.options}>
        {variants.map((variant) => {
          const composition = generateCompositionLabel({
            purity: variant.purity,
            purityVerified: variant.purityVerified,
            finish: variant.finish,
          });
          const selected = variant.id === selectedVariantId;

          return (
            <label
              key={variant.id}
              className={styles.option}
              data-selected={selected}
              htmlFor={`variant-${variant.id}`}
            >
              <input
                id={`variant-${variant.id}`}
                type="radio"
                name="product-variant"
                value={variant.id}
                checked={selected}
                onChange={() => onChange(variant.id)}
              />
              <span className={styles.description}>
                <span className={styles.name}>{variant.name}</span>
                <span className={styles.facts}>
                  {composition} · {formatWeight(variant.weightGrams)} · {finishLabel(variant.finish)}
                </span>
                {variant.stockQuantity === 0 && (
                  <span className={styles.availability}>Out of stock</span>
                )}
              </span>
              <span className={styles.price}>
                {variant.pricePaise === null ? 'Price unavailable' : formatInr(variant.pricePaise)}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
