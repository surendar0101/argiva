import { cleanup, render, screen } from '@testing-library/react';
import { ThemeProvider } from '@argiva/ui';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { getSearchProducts } from '../../lib/catalog';
import SearchPage from './page';

vi.mock('../../lib/catalog', () => ({
  getSearchProducts: vi.fn(),
}));

const searchResult = {
  id: 'product-chain',
  variantId: 'variant-chain-20',
  name: 'Classic Curb Silver Chain',
  slug: 'classic-curb-silver-chain',
  pricePaise: 210825,
  purity: '92.5' as const,
  purityVerified: true,
  finish: 'plain' as const,
  weightGrams: 18.2,
};

async function renderSearch(query?: string) {
  const page = await SearchPage({
    searchParams: Promise.resolve(query === undefined ? {} : { q: query }),
  });
  render(<ThemeProvider themeId="quiet-luxury">{page}</ThemeProvider>);
}

describe('SearchPage', () => {
  afterEach(cleanup);

  test('shows matching products for the submitted query', async () => {
    vi.mocked(getSearchProducts).mockResolvedValueOnce([searchResult]);

    await renderSearch('curb');

    expect(screen.getByRole('searchbox', { name: 'Search products' })).toHaveValue('curb');
    expect(screen.getByRole('link', { name: 'Classic Curb Silver Chain' })).toHaveAttribute(
      'href',
      '/products/classic-curb-silver-chain',
    );
    expect(getSearchProducts).toHaveBeenCalledWith('curb');
  });

  test('prompts shoppers to enter a query without fetching the full catalog', async () => {
    await renderSearch();

    expect(screen.getByText(/enter a product name, finish, silver composition or sku/i)).toBeInTheDocument();
    expect(getSearchProducts).not.toHaveBeenCalled();
  });

  test('explains when a query has no matches', async () => {
    vi.mocked(getSearchProducts).mockResolvedValueOnce([]);

    await renderSearch('unknown');

    expect(screen.getByRole('status')).toHaveTextContent('No products match your search.');
  });
});
