import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { CartProvider, useCart } from '../../../components/cart/cart-context';
import { getProductBySlug } from '../../../lib/catalog';
import ProductPage, { generateMetadata } from './page';

vi.mock('../../../lib/catalog', () => ({
  getProductBySlug: vi.fn(),
}));

vi.mock('@argiva/config', () => ({
  getConfig: () => ({ baseUrl: 'https://argiva.test' }),
}));

const firstVariant = {
  id: 'variant-chain-20',
  sku: 'CHN-CRB-925',
  name: '20 inch Chain',
  purity: '92.5' as const,
  purityVerified: true,
  finish: 'plain' as const,
  weightGrams: 18.2,
  dimensions: null,
  pricingMode: 'silver_rate' as const,
  pricePaise: 210825,
  stockQuantity: 20,
  isPair: false,
};

const product = {
  id: 'product-chain',
  name: 'Classic Curb Silver Chain',
  slug: 'classic-curb-silver-chain',
  description: 'Precision-crafted sterling silver curb chain with secure lobster clasp.',
  searchTitle: 'Classic Curb Chain | ARGIVA Silvers',
  metaDescription: 'A precision-crafted silver curb chain.',
  careInstructions: 'Clean gently with a soft microfibre cloth.',
  returnEligibility: 'Replacement only for reported transit damage within 2 days with unboxing video.',
  category: { name: 'Chains & Pendants', slug: 'chains-and-pendants' },
  pricingUnavailable: false,
  variants: [
    firstVariant,
    {
      id: 'variant-chain-24',
      sku: 'CHN-CRB-800',
      name: 'Size 2.4',
      purity: '80' as const,
      purityVerified: true,
      finish: 'rose_gold' as const,
      weightGrams: 28,
      dimensions: '2.4',
      pricingMode: 'fixed' as const,
      pricePaise: 179900,
      stockQuantity: 8,
      isPair: false,
    },
  ],
};

function CartCount() {
  const { totalCount } = useCart();
  return <p>Cart count: {totalCount}</p>;
}

function isJsonRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseStructuredData(script: HTMLScriptElement): Record<string, unknown> {
  const parsed: unknown = JSON.parse(script.textContent ?? '{}');
  if (!isJsonRecord(parsed)) {
    throw new Error('Expected JSON-LD to be an object.');
  }
  return parsed;
}

async function renderProductPage() {
  const page = await ProductPage({
    params: Promise.resolve({ slug: product.slug }),
  });
  return render(
    <CartProvider>
      {page}
      <CartCount />
    </CartProvider>,
  );
}

describe('ProductPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(getProductBySlug).mockResolvedValue(product);
  });

  afterEach(cleanup);

  test('uses authored product SEO fields for page metadata', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: product.slug }),
    });

    expect(metadata).toMatchObject({
      title: product.searchTitle,
      description: product.metaDescription,
      alternates: { canonical: `/products/${product.slug}` },
      openGraph: {
        title: product.searchTitle,
        description: product.metaDescription,
        url: `/products/${product.slug}`,
      },
    });
  });

  test('renders Product and BreadcrumbList structured data', async () => {
    const { container } = await renderProductPage();
    const scripts = Array.from(container.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]'));
    const structuredData = scripts.map((script) => parseStructuredData(script));

    expect(structuredData).toHaveLength(2);
    expect(structuredData[0]).toMatchObject({
      '@type': 'Product',
      name: product.name,
      url: `https://argiva.test/products/${product.slug}`,
      offers: [
        { priceCurrency: 'INR', price: '2108.25' },
        { priceCurrency: 'INR', price: '1799.00' },
      ],
    });
    expect(structuredData[1]).toMatchObject({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { position: 1, name: 'Home', item: 'https://argiva.test/' },
        { position: 2, name: 'Collections', item: 'https://argiva.test/collections' },
        { position: 3, name: product.category.name },
        { position: 4, name: product.name },
      ],
    });
  });

  test('renders product facts and a placeholder when product photography is unavailable', async () => {
    await renderProductPage();

    expect(screen.getByRole('heading', { name: product.name, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(product.description)).toBeInTheDocument();
    expect(screen.getByText(product.careInstructions)).toBeInTheDocument();
    expect(screen.getByText(product.returnEligibility)).toBeInTheDocument();
    expect(screen.getByText(/records a video of the product packaging process/i)).toBeInTheDocument();
    expect(screen.getByText('925 sterling silver')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: `${product.name} photograph coming soon` })).toBeInTheDocument();
  });

  test('updates price and product facts when a different variant is selected', async () => {
    const user = userEvent.setup();
    await renderProductPage();

    expect(screen.getByRole('group', { name: 'Purchase' })).toHaveTextContent('₹2,108.25');
    await user.click(screen.getByRole('radio', { name: /Size 2.4/ }));

    expect(screen.getByRole('group', { name: 'Purchase' })).toHaveTextContent('₹1,799');
    expect(screen.getByText('28 g')).toBeInTheDocument();
    expect(screen.getAllByText('80% silver with other metals (rose-gold finish)').length).toBeGreaterThan(0);
  });

  test('adds the selected variant to the cart', async () => {
    const user = userEvent.setup();
    await renderProductPage();

    await user.click(screen.getByRole('button', { name: 'Add to Cart' }));

    expect(await screen.findByText('Cart count: 1')).toBeInTheDocument();
  });

  test('explains unavailable silver-rate pricing and prevents adding it to the cart', async () => {
    vi.mocked(getProductBySlug).mockResolvedValueOnce({
      ...product,
      pricingUnavailable: true,
      variants: [{ ...firstVariant, pricePaise: null }],
    });

    await renderProductPage();

    expect(screen.getByRole('status')).toHaveTextContent(/current silver rate could not be confirmed/i);
    expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeDisabled();
  });

  test('does not blame the silver rate when a fixed price is missing', async () => {
    vi.mocked(getProductBySlug).mockResolvedValueOnce({
      ...product,
      pricingUnavailable: true,
      variants: [{ ...firstVariant, pricingMode: 'fixed', pricePaise: null }],
    });

    await renderProductPage();

    expect(screen.getByRole('status')).toHaveTextContent('Price unavailable');
    expect(screen.queryByText(/silver rate/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeDisabled();
  });

  test('shows product availability instead of a silver-rate message when there are no active variants', async () => {
    vi.mocked(getProductBySlug).mockResolvedValueOnce({
      ...product,
      variants: [],
    });

    await renderProductPage();

    expect(screen.getByText('No active variants are currently available.')).toBeInTheDocument();
    expect(screen.queryByText(/current silver rate could not be confirmed/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeDisabled();
  });

  test('prevents adding an out-of-stock variant to the cart', async () => {
    vi.mocked(getProductBySlug).mockResolvedValueOnce({
      ...product,
      variants: [{ ...firstVariant, stockQuantity: 0 }],
    });

    await renderProductPage();

    expect(screen.getByRole('button', { name: 'Out of Stock' })).toBeDisabled();
  });
});
