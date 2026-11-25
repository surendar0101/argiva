import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CollectionResults } from './collection-results';
import { getCollectionDescription } from '../../../lib/collection-copy';
import { getCategoryBySlug, getProductsByCategory } from '../../../lib/catalog';
import styles from './page.module.css';

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = await getProductsByCategory(category.id);
  const description = getCollectionDescription(category);

  return (
    <main className={styles.page}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <ol>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/collections">Collections</Link></li>
          <li aria-current="page">{category.name}</li>
        </ol>
      </nav>
      <header className={styles.header}>
        <h1>{category.name}</h1>
        {description && <p>{description}</p>}
      </header>
      <CollectionResults products={products} />
    </main>
  );
}
