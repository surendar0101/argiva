import Link from 'next/link';
import { getCollectionDescription } from '../../lib/collection-copy';
import type { Category } from '../../lib/catalog';
import styles from './collection-grid.module.css';

export function CollectionGrid({ categories }: { categories: Category[] }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Find Your Everyday Silver.</h2>
      <p className={styles.intro}>
        From delicate details to statement pieces, discover silver jewellery for every style, celebration and story.
      </p>
      <div className={styles.grid}>
        {categories.map((category) => {
          const description = getCollectionDescription(category);

          return (
            <Link key={category.id} href={`/collections/${category.slug}`} className={styles.card}>
              <h3 className={styles.cardTitle}>{category.name}</h3>
              {description ? <p className={styles.cardDescription}>{description}</p> : null}
            </Link>
          );
        })}
      </div>
      <div className={styles.actions}>
        <Link href="/collections" className={styles.button}>
          Shop All Collections
        </Link>
      </div>
    </section>
  );
}
