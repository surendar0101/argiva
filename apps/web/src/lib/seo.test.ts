import { beforeEach, describe, expect, test, vi } from 'vitest';
import sitemap from '../app/sitemap';
import robots, { dynamic as robotsDynamic } from '../app/robots';
import type { ProductDetail } from './catalog';
import {
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildProductJsonLd,
  buildProductMetadata,
  buildSiteMetadata,
  serializeJsonLd,
} from './seo';

const mockState = vi.hoisted(() => ({
  appEnv: 'local',
  baseUrl: 'https://argiva.test',
  categories: [] as Array<{ slug: string }>,
  productSlugs: [] as string[],
  policySlugs: [] as string[],
}));

vi.mock('@argiva/config', () => ({
  getConfig: () => ({ appEnv: mockState.appEnv, baseUrl: mockState.baseUrl }),
}));

vi.mock('./catalog', () => ({
  getCategories: vi.fn(() => Promise.resolve(mockState.categories)),
  getPublishedProductSlugs: vi.fn(() => Promise.resolve(mockState.productSlugs)),
}));

vi.mock('./policies', () => ({
  getPolicySlugs: vi.fn(() => Promise.resolve(mockState.policySlugs)),
}));

const product: ProductDetail = {
  id: 'product-chain',
  name: 'Classic Curb Silver Chain',
  slug: 'classic-curb-silver-chain',
  description: 'A silver chain for everyday wear.',
  searchTitle: 'Classic Curb Chain | ARGIVA Silvers',
  metaDescription: 'A precision-crafted silver curb chain.',
  careInstructions: null,
  returnEligibility: null,
  category: { name: 'Chains & Pendants', slug: 'chains-and-pendants' },
  pricingUnavailable: true,
  variants: [
    {
      id: 'variant-priced',
      sku: 'CHN-CRB-925',
      name: '20 inch Chain',
      purity: '92.5',
      purityVerified: true,
      finish: 'plain',
      weightGrams: 18.2,
      dimensions: null,
      pricingMode: 'fixed',
      pricePaise: 12345,
      stockQuantity: 2,
      isPair: false,
    },
    {
      id: 'variant-unpriced',
      sku: 'CHN-CRB-925-L',
      name: '24 inch Chain',
      purity: '92.5',
      purityVerified: true,
      finish: 'plain',
      weightGrams: 20,
      dimensions: null,
      pricingMode: 'silver_rate',
      pricePaise: null,
      stockQuantity: 0,
      isPair: false,
    },
  ],
};

beforeEach(() => {
  mockState.appEnv = 'local';
  mockState.baseUrl = 'https://argiva.test';
  mockState.categories = [];
  mockState.productSlugs = [];
  mockState.policySlugs = [];
});

describe('SEO helpers', () => {
  test('sets the site metadata base, title template, Open Graph defaults, and environment robots policy', () => {
    expect(buildSiteMetadata(mockState.baseUrl, false)).toMatchObject({
      metadataBase: new URL('https://argiva.test'),
      title: { default: 'ARGIVA Silvers', template: '%s | ARGIVA Silvers' },
      description: 'Modern Silver. Timeless Stories.',
      alternates: { canonical: '/' },
      openGraph: {
        type: 'website',
        siteName: 'ARGIVA Silvers',
        url: '/',
      },
      robots: { index: false, follow: false },
    });
  });

  test('builds product metadata from authored SEO fields and a canonical product URL', () => {
    expect(buildProductMetadata(product)).toMatchObject({
      title: 'Classic Curb Chain | ARGIVA Silvers',
      description: 'A precision-crafted silver curb chain.',
      alternates: { canonical: '/products/classic-curb-silver-chain' },
      openGraph: {
        title: 'Classic Curb Chain | ARGIVA Silvers',
        description: 'A precision-crafted silver curb chain.',
        url: '/products/classic-curb-silver-chain',
      },
    });
  });

  test('omits Product offers when every variant price is unavailable', () => {
    const unavailableProduct = {
      ...product,
      variants: product.variants.map((variant) => ({ ...variant, pricePaise: null })),
    };

    expect(buildProductJsonLd(unavailableProduct, mockState.baseUrl)).not.toHaveProperty('offers');
  });

  test('builds Product JSON-LD with INR offers only for variants with a known price', () => {
    expect(buildProductJsonLd(product, mockState.baseUrl)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      url: 'https://argiva.test/products/classic-curb-silver-chain',
      brand: { '@type': 'Brand', name: 'ARGIVA Silvers' },
      offers: [
        {
          '@type': 'Offer',
          url: 'https://argiva.test/products/classic-curb-silver-chain',
          priceCurrency: 'INR',
          price: '123.45',
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
        },
      ],
    });
  });

  test('builds Organization JSON-LD using the configured site URL and approved Instagram account', () => {
    expect(buildOrganizationJsonLd(mockState.baseUrl, 'https://www.instagram.com/argiva_silvers/')).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'ARGIVA Silvers',
      url: 'https://argiva.test/',
      sameAs: ['https://www.instagram.com/argiva_silvers/'],
    });
  });

  test('uses the configured Instagram URL in Organization JSON-LD', () => {
    expect(buildOrganizationJsonLd(mockState.baseUrl, 'https://instagram.example/argiva')).toHaveProperty(
      'sameAs',
      ['https://instagram.example/argiva'],
    );
  });

  test('omits Organization sameAs when no Instagram URL is configured', () => {
    expect(buildOrganizationJsonLd(mockState.baseUrl)).not.toHaveProperty('sameAs');
  });

  test('builds BreadcrumbList JSON-LD with one-based positions and absolute URLs', () => {
    expect(
      buildBreadcrumbJsonLd(
        [
          { name: 'Home', path: '/' },
          { name: 'Collections', path: '/collections' },
          { name: 'Chains & Pendants', path: '/collections/chains-and-pendants' },
        ],
        mockState.baseUrl,
      ),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://argiva.test/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Collections',
          item: 'https://argiva.test/collections',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Chains & Pendants',
          item: 'https://argiva.test/collections/chains-and-pendants',
        },
      ],
    });
  });

  test('serializes JSON-LD without allowing data to close its script element', () => {
    expect(serializeJsonLd({ description: '</script><img src=x>' })).toBe(
      '{"description":"\\u003c/script\\u003e\\u003cimg src=x\\u003e"}',
    );
  });
});

describe('SEO route metadata', () => {
  test('lists storefront routes and stored policy routes in the sitemap', async () => {
    mockState.categories = [{ slug: 'chains-and-pendants' }];
    mockState.productSlugs = ['classic-curb-silver-chain'];
    mockState.policySlugs = ['shipping', 'terms'];

    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toEqual(
      expect.arrayContaining([
        'https://argiva.test/',
        'https://argiva.test/collections',
        'https://argiva.test/collections/chains-and-pendants',
        'https://argiva.test/products/classic-curb-silver-chain',
        'https://argiva.test/policies/shipping',
        'https://argiva.test/policies/terms',
        'https://argiva.test/our-story',
        'https://argiva.test/faq',
        'https://argiva.test/contact',
      ]),
    );
    expect(new Set(urls).size).toBe(urls.length);
    expect(entries.find((entry) => entry.url === 'https://argiva.test/collections')).toMatchObject({
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  test('disallows crawling outside production and advertises the configured sitemap URL', () => {
    expect(robots()).toEqual({
      rules: { userAgent: '*', disallow: '/' },
      sitemap: 'https://argiva.test/sitemap.xml',
    });
  });

  test('renders robots policy at request time using deployment configuration', () => {
    expect(robotsDynamic).toBe('force-dynamic');
  });

  test('allows crawling in production and advertises the configured sitemap URL', () => {
    mockState.appEnv = 'production';

    expect(robots()).toEqual({
      rules: { userAgent: '*', allow: '/' },
      sitemap: 'https://argiva.test/sitemap.xml',
    });
  });
});
