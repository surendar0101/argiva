import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { getCategoryBySlug, getProductsByCategory } from '../../../lib/catalog';
import CollectionPage from './page';

vi.mock('../../../lib/catalog', () => ({
  getCategoryBySlug: vi.fn(),
  getProductsByCategory: vi.fn(),
}));

afterEach(cleanup);

const category = {
  id: 'category-1',
  name: 'Chains & Pendants',
  slug: 'chains-and-pendants',
  description: 'Category description',
};

const products = [
  {
    id: 'product-1',
    variantId: 'variant-1',
    name: 'Plain Chain',
    slug: 'plain-chain',
    pricePaise: 250000,
    purity: '92.5' as const,
    purityVerified: true,
    finish: 'plain' as const,
    weightGrams: 12.5,
  },
  {
    id: 'product-2',
    variantId: 'variant-2',
    name: 'Oxidised Band',
    slug: 'oxidised-band',
    pricePaise: 180000,
    purity: '80' as const,
    purityVerified: false,
    finish: 'oxidised' as const,
    weightGrams: 9.2,
  },
];

describe('CollectionPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders collection heading, breadcrumbs, filters, and products', async () => {
    vi.mocked(getCategoryBySlug).mockResolvedValue(category);
    vi.mocked(getProductsByCategory).mockResolvedValue(products);

    render(await CollectionPage({ params: Promise.resolve({ slug: category.slug }) }));

    expect(screen.getByRole('heading', { name: category.name })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Silver chains and pendants that bring effortless elegance to everyday outfits and special occasions. Discover delicate details, versatile styles and pieces that feel distinctly yours.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByRole('toolbar', { name: 'Product filters' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Plain Chain' })).toHaveAttribute(
      'href',
      '/products/plain-chain',
    );
    expect(screen.getByRole('link', { name: 'Oxidised Band' })).toBeInTheDocument();
  });

  test('shows a clear-filter recovery when active filters return no products', async () => {
    vi.mocked(getCategoryBySlug).mockResolvedValue(category);
    vi.mocked(getProductsByCategory).mockResolvedValue(products);

    render(await CollectionPage({ params: Promise.resolve({ slug: category.slug }) }));

    fireEvent.click(screen.getByRole('button', { name: '92.5' }));
    fireEvent.click(screen.getByRole('button', { name: 'Oxidised' }));

    expect(screen.getByText('No products match these filters.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByRole('link', { name: 'Plain Chain' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Oxidised Band' })).toBeInTheDocument();
  });

  test('shows an explicit empty collection message when there are no products', async () => {
    vi.mocked(getCategoryBySlug).mockResolvedValue(category);
    vi.mocked(getProductsByCategory).mockResolvedValue([]);

    render(await CollectionPage({ params: Promise.resolve({ slug: category.slug }) }));

    expect(screen.getByText('There are no products in this collection yet.')).toBeInTheDocument();
  });
});
