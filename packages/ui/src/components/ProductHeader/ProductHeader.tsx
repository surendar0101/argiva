'use client';
import { useState } from 'react';
import { formatWeight } from '../../lib/format';
import type { ImageData } from '../../types';
import { Button } from '../Button/Button';
import { Price } from '../Price/Price';
import { PurityBadge, type PurityTone } from '../PurityBadge/PurityBadge';
import styles from './ProductHeader.module.css';

export type ProductHeaderProps = {
  name: string;
  images: [ImageData, ...ImageData[]];
  pricePaise: number;
  weightGrams: number;
  finish: string;
  purity: { label: string; tone: PurityTone };
  addToCartLabel: string;
  onAddToCart: () => void;
};

export function ProductHeader({ name, images, pricePaise, weightGrams, finish, purity, addToCartLabel, onAddToCart }: ProductHeaderProps) {
  const [active, setActive] = useState(0);
  const main = images[active] ?? images[0];
  return (
    <section className={styles.layout}>
      <div className={styles.gallery}>
        <div className={styles.main}>
          <img src={main.src} alt={main.alt} width={main.width} height={main.height} fetchPriority="high" />
        </div>
        {images.length > 1 ? (
          <ul className={styles.thumbs}>
            {images.map((img, i) => (
              <li key={img.src}>
                <button type="button" aria-pressed={i === active} aria-label={`Show image ${i + 1}: ${img.alt}`} onClick={() => setActive(i)}>
                  <img src={img.src} alt="" width={img.width} height={img.height} loading="lazy" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className={styles.details}>
        <PurityBadge {...purity} />
        <h1 className={styles.name}>{name}</h1>
        <Price paise={pricePaise} size="lg" />
        <dl className={styles.facts}>
          <div><dt>Weight</dt><dd className="argiva-ledger">{formatWeight(weightGrams)}</dd></div>
          <div><dt>Finish</dt><dd>{finish}</dd></div>
        </dl>
        <div className={styles.cta}>
          <Button onClick={onAddToCart}>{addToCartLabel}</Button>
        </div>
      </div>
    </section>
  );
}
