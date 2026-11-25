import { getConfig } from '@argiva/config';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from '../../../components/product/product-detail-client';
import { ProductGallery } from '../../../components/product/product-gallery';
import { getProductBySlug } from '../../../lib/catalog';
import {
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
  buildProductMetadata,
  serializeJsonLd,
} from '../../../lib/seo';
import styles from './page.module.css';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { robots: { index: false, follow: false } };
  }

  return buildProductMetadata(product);
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const baseUrl = getConfig().baseUrl;
  const productJsonLd = buildProductJsonLd(product, baseUrl);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(
    [
      { name: 'Home', path: '/' },
      { name: 'Collections', path: '/collections' },
      { name: product.category.name, path: `/collections/${encodeURIComponent(product.category.slug)}` },
      { name: product.name, path: `/products/${encodeURIComponent(product.slug)}` },
    ],
    baseUrl,
  );

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <ol>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/collections">Collections</Link></li>
          <li><Link href={`/collections/${product.category.slug}`}>{product.category.name}</Link></li>
          <li aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className={styles.productLayout}>
        <ProductGallery name={product.name} />
        <ProductDetailClient product={product} />
      </div>

      <div className={styles.information}>
        <section>
          <h2>About this piece</h2>
          <p>{product.description}</p>
        </section>
        {product.careInstructions && (
          <section>
            <h2>Care instructions</h2>
            <p>{product.careInstructions}</p>
          </section>
        )}
        {product.returnEligibility && (
          <section>
            <h2>Return eligibility</h2>
            <p>{product.returnEligibility}</p>
          </section>
        )}
        <section className={styles.packaging}>
          <h2>Packaging video</h2>
          <p>
            For transparency, ARGIVA records a video of the product packaging process and shares it
            with the customer along with the online invoice.
          </p>
        </section>
      </div>
    </main>
  );
}
