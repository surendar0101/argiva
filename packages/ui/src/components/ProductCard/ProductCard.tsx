import { formatWeight } from '../../lib/format';
import type { ImageData } from '../../types';
import { Price } from '../Price/Price';
import { PurityBadge, type PurityTone } from '../PurityBadge/PurityBadge';
import styles from './ProductCard.module.css';

export type ProductCardProps = {
  href: string;
  name: string;
  image?: ImageData;
  /** null when no price can be shown, for example while the silver rate is unconfirmed. */
  pricePaise: number | null;
  weightGrams: number;
  finish: string;
  purity: { label: string; tone: PurityTone };
};

export function ProductCard({ href, name, image, pricePaise, weightGrams, finish, purity }: ProductCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {image ? (
          <img
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className={styles.placeholder} role="img" aria-label={`${name} photograph coming soon`}>
            Photograph coming soon
          </div>
        )}
        <div className={styles.badge}><PurityBadge {...purity} /></div>
      </div>
      <h3 className={styles.name}>
        <a href={href} className={styles.link}>{name}</a>
      </h3>
      <p className={styles.meta}>
        <span>{`${formatWeight(weightGrams)} · ${finish}`}</span>
        {pricePaise === null ? <span>Price unavailable</span> : <Price paise={pricePaise} />}
      </p>
    </article>
  );
}
