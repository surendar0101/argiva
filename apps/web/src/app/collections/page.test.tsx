import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { getCategories } from '../../lib/catalog';
import CollectionsPage from './page';

vi.mock('../../lib/catalog', () => ({
  getCategories: vi.fn(),
}));

afterEach(cleanup);

describe('CollectionsPage', () => {
  test('renders active categories with links to their collection pages', async () => {
    vi.mocked(getCategories).mockResolvedValue([
      {
        id: 'category-1',
        name: 'Chains & Pendants',
        slug: 'chains-and-pendants',
        description: 'Category database description',
      },
      {
        id: 'category-2',
        name: 'Anklets — Our Heritage Collection',
        slug: 'anklets',
        description: 'Anklet database description',
      },
    ]);

    render(await CollectionsPage());

    expect(screen.getByRole('heading', { name: 'Find Your Everyday Silver.' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'Silver chains and pendants that bring effortless elegance to everyday outfits and special occasions. Discover delicate details, versatile styles and pieces that feel distinctly yours.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Chains & Pendants/ })).toHaveAttribute(
      'href',
      '/collections/chains-and-pendants',
    );
    expect(screen.getByRole('link', { name: /Anklets — Our Heritage Collection/ })).toHaveAttribute(
      'href',
      '/collections/anklets',
    );
  });
});
