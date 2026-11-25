import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { getCategories } from '../lib/catalog';
import HomePage from './page';

vi.mock('../lib/catalog', () => ({
  getCategories: vi.fn(),
}));

const categories = [
  { id: 'category-1', name: 'Chains & Pendants', slug: 'chains-and-pendants', description: null },
  { id: 'category-2', name: 'Earrings', slug: 'earrings', description: null },
  { id: 'category-3', name: 'Bangles & Bracelets', slug: 'bangles-and-bracelets', description: null },
  {
    id: 'category-4',
    name: 'Anklets — Our Heritage Collection',
    slug: 'anklets',
    description: null,
  },
  { id: 'category-5', name: 'Rings', slug: 'rings', description: null },
  { id: 'category-6', name: 'Silver Gifting', slug: 'silver-gifting', description: null },
];

describe('HomePage', () => {
  beforeEach(() => {
    vi.mocked(getCategories).mockResolvedValue(categories);
  });

  afterEach(() => {
    cleanup();
  });

  test('renders hero headline', async () => {
    render(await HomePage());
    expect(screen.getByText(/Generations of Silver. A New Story to Wear./i)).toBeInTheDocument();
  });

  test('renders collection links using active category slugs', async () => {
    render(await HomePage());
    expect(screen.getByRole('link', { name: /Chains & Pendants/ })).toHaveAttribute(
      'href',
      '/collections/chains-and-pendants',
    );
    expect(
      screen.getByRole('link', { name: /Anklets — Our Heritage Collection/ }),
    ).toHaveAttribute('href', '/collections/anklets');
    expect(screen.getByRole('link', { name: /Silver Gifting/ })).toHaveAttribute(
      'href',
      '/collections/silver-gifting',
    );
  });

  test('requests no hero image while photography is unavailable', async () => {
    const { container } = render(await HomePage());
    expect(container.querySelector('img')).toBeNull();
  });

  test('renders heritage section', async () => {
    render(await HomePage());
    expect(screen.getByText(/A Legacy That Deserves to Shine/i)).toBeInTheDocument();
  });

  test('renders ARGIVA Promise section', async () => {
    render(await HomePage());
    expect(screen.getByText(/The ARGIVA Promise/i)).toBeInTheDocument();
    expect(screen.getByText(/Rooted in Legacy/i)).toBeInTheDocument();
    expect(screen.getByText(/Made for Modern Living/i)).toBeInTheDocument();
  });

  test('renders call-to-action button', async () => {
    render(await HomePage());
    expect(screen.getByText(/Explore Collections/i)).toBeInTheDocument();
  });
});
