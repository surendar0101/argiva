import { cleanup, render, screen } from '@testing-library/react';
import { ThemeProvider } from '@argiva/ui';
import { afterEach, describe, expect, test, vi } from 'vitest';
import ContactPage from '../contact/page';
import FAQPage from '../faq/page';
import OurStoryPage from '../our-story/page';
import PolicyPage from './[slug]/page';
import { getPolicyBySlug } from '../../lib/policies';

vi.mock('../../lib/policies', () => ({
  getPolicyBySlug: vi.fn(),
}));

afterEach(cleanup);

describe('Task 6 storefront pages', () => {
  test('renders the approved Our Story headline and family narrative', () => {
    render(
      <ThemeProvider themeId="quiet-luxury">
        <OurStoryPage />
      </ThemeProvider>,
    );

    expect(screen.getByRole('heading', { name: 'Three Generations. One Continuing Legacy.' })).toBeInTheDocument();
    expect(screen.getByText('Every family business begins with a dream. Ours began with our grandfather.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'A Legacy, Reimagined' })).toBeInTheDocument();
  });

  test('renders all eleven approved FAQ entries and their answers', () => {
    const { container } = render(<FAQPage />);

    expect(container.querySelectorAll('details')).toHaveLength(11);
    expect(screen.getByText('Can I pay cash on delivery?')).toBeInTheDocument();
    expect(
      screen.getByText('No. Cash on delivery is not available. Please use one of the supported online payment methods.'),
    ).toBeInTheDocument();
    expect(screen.getByText('How can I contact ARGIVA?')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Use the official contact details published on our website or message us through our Instagram account: https://www.instagram.com/argiva_silvers/',
      ),
    ).toBeInTheDocument();
  });

  test('shows Instagram and does not invent an unresolved WhatsApp link', () => {
    render(<ContactPage />);

    expect(screen.getByRole('link', { name: '@argiva_silvers' })).toHaveAttribute(
      'href',
      'https://www.instagram.com/argiva_silvers/',
    );
    expect(screen.getByText(/TODO\(owner\): official WhatsApp click-to-chat URL/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /WhatsApp/ })).not.toBeInTheDocument();
  });

  test('renders policy content from storage with the required draft banner', async () => {
    vi.mocked(getPolicyBySlug).mockResolvedValue({
      slug: 'shipping',
      title: 'Shipping & Delivery',
      status: 'draft',
      content: [
        { type: 'heading', text: 'Delivery information' },
        { type: 'paragraph', text: 'Approved policy draft copy.' },
      ],
    });

    const page = await PolicyPage({ params: Promise.resolve({ slug: 'shipping' }) });
    render(page);

    expect(screen.getByRole('note')).toHaveTextContent('Draft Policy — Pending Owner Sign-off');
    expect(screen.getByRole('heading', { name: 'Shipping & Delivery' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Delivery information' })).toBeInTheDocument();
    expect(screen.getByText('Approved policy draft copy.')).toBeInTheDocument();
    expect(getPolicyBySlug).toHaveBeenCalledWith('shipping');
  });
});
