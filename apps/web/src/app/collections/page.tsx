import Link from 'next/link';
import { getCollectionDescription } from '../../lib/collection-copy';
import { getCategories } from '../../lib/catalog';
import styles from './page.module.css';

export default async function CollectionsPage() {
  const categories = await getCategories();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Find Your Everyday Silver.</h1>
        <p>From delicate details to statement pieces, discover silver jewellery for every style, celebration and story.</p>
      </header>
      {categories.length > 0 ? (
        <ul className={styles.list}>
          {categories.map((category) => (
            <li className={styles.item} key={category.id}>
              <Link className={styles.link} href={`/collections/${category.slug}`}>
                <span className={styles.name}>{category.name}</span>
                <span className={styles.description}>
                  {getCollectionDescription(category)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>Collections are being prepared. Please check back soon.</p>
      )}
    </main>
  );
}
