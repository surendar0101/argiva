import type { Metadata } from 'next';
import type { ProductDetail } from './catalog';

const SITE_NAME = 'ARGIVA Silvers';

export interface BreadcrumbItem {
  name: string;
  path: string;
}

function productPath(slug: string): string {
  return `/products/${encodeURIComponent(slug)}`;
}

function absoluteUrl(path: string, baseUrl: string): string {
  return new URL(path, baseUrl).toString();
}

function formatPaise(paise: number): string {
  const amount = Math.abs(paise);
  const sign = paise < 0 ? '-' : '';
  return `${sign}${Math.floor(amount / 100)}.${String(amount % 100).padStart(2, '0')}`;
}

export function buildSiteMetadata(baseUrl: string, isProduction: boolean): Metadata {
  return {
    metadataBase: new URL(baseUrl),
    title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
    description: 'Modern Silver. Timeless Stories.',
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: 'Modern Silver. Timeless Stories.',
      url: '/',
    },
    robots: { index: isProduction, follow: isProduction },
  };
}

export function buildProductMetadata(product: ProductDetail): Metadata {
  const title = product.searchTitle?.trim() || product.name;
  const description = product.metaDescription?.trim() || product.description;
  const path = productPath(product.slug);

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: 'website', title, description, url: path },
  };
}

export function buildProductJsonLd(product: ProductDetail, baseUrl: string): Record<string, unknown> {
  const url = absoluteUrl(productPath(product.slug), baseUrl);
  const offers = product.variants.flatMap((variant) => {
    if (variant.pricePaise === null) {
      return [];
    }

    return [{
      '@type': 'Offer',
      url,
      priceCurrency: 'INR',
      price: formatPaise(variant.pricePaise),
      availability: variant.stockQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    }];
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    url,
    brand: { '@type': 'Brand', name: SITE_NAME },
    ...(offers.length > 0 ? { offers } : {}),
  };
}

export function buildOrganizationJsonLd(baseUrl: string, instagramUrl?: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: absoluteUrl('/', baseUrl),
    ...(instagramUrl ? { sameAs: [instagramUrl] } : {}),
  };
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[], baseUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, baseUrl),
    })),
  };
}

export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/[<>&]/g, (character) => {
    switch (character) {
      case '<':
        return '\\u003c';
      case '>':
        return '\\u003e';
      case '&':
        return '\\u0026';
      default:
        return character;
    }
  });
}
