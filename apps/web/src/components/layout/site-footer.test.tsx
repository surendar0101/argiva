import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { getCategories } from '../../lib/catalog';
import { SiteFooter } from './site-footer';

vi.mock('../../lib/catalog', () => ({
  getCategories: vi.fn(),
}));

afterEach(cleanup);

describe('SiteFooter', () => {
  beforeEach(() => {
    vi.mocked(getCategories).mockResolvedValue([
      {
        id: 'category-1',
        name: 'Chains & Pendants',
        slug: 'chains-and-pendants',
        description: null,
      },
    ]);
  });

  test('uses the active category slug for collection links', async () => {
    render(await SiteFooter());

    expect(screen.getByRole('link', { name: 'Chains & Pendants' })).toHaveAttribute(
      'href',
      '/collections/chains-and-pendants',
    );
  });

  test('keeps a collections link when no active categories exist', async () => {
    vi.mocked(getCategories).mockResolvedValueOnce([]);

    render(await SiteFooter());

    expect(screen.getByRole('link', { name: 'Shop All Collections' })).toHaveAttribute(
      'href',
      '/collections',
    );
  });

  test('uses the configured Instagram profile URL', async () => {
    render(await SiteFooter());

    expect(screen.getByRole('link', { name: 'Follow us on Instagram' })).toHaveAttribute(
      'href',
      'https://www.instagram.com/argiva_silvers/',
    );
  });

  test('links all eight policy pages and does not expose a broken WhatsApp URL', async () => {
    render(await SiteFooter());

    for (const href of [
      '/policies/terms',
      '/policies/privacy',
      '/policies/shipping',
      '/policies/returns',
      '/policies/cancellation',
      '/policies/care',
      '/policies/cookies',
      '/policies/contact-disclosures',
    ]) {
      expect(document.querySelector(`a[href="${href}"]`)).not.toBeNull();
    }

    expect(screen.queryByRole('link', { name: 'Contact us on WhatsApp' })).not.toBeInTheDocument();
    expect(document.body).toHaveTextContent('WhatsApp: Details coming soon.');
    expect(document.body.textContent).not.toContain('TODO(owner)');
  });
});
