import { formatWeight } from '../../lib/format';
import type { ImageData } from '../../types';
import { Price } from '../Price/Price';
import { PurityBadge, type PurityTone } from '../PurityBadge/PurityBadge';
import styles from './ProductCard.module.css';

export type ProductCardProps = {
  href: string;
  name: string;
  image: ImageData;
  pricePaise: number;
  weightGrams: number;
  finish: string;
  purity: { label: string; tone: PurityTone };
};

export function ProductCard({ href, name, image, pricePaise, weightGrams, finish, purity }: ProductCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <img src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async" />
        <div className={styles.badge}><PurityBadge {...purity} /></div>
      </div>
      <h3 className={styles.name}>
        <a href={href} className={styles.link}>{name}</a>
      </h3>
      <p className={styles.meta}>
        <span>{`${formatWeight(weightGrams)} · ${finish}`}</span>
        <Price paise={pricePaise} />
      </p>
    </article>
  );
}
