import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/axe';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Hero } from './Hero';

const props = {
  eyebrow: 'Placeholder eyebrow',
  title: 'Modern Silver. Timeless Stories.',
  body: 'Placeholder hero text.',
  action: { href: '/collections', label: 'Shop the collection' },
  image: { src: '/h.svg', alt: 'Silver anklet resting on indigo cloth', width: 1200, height: 1500 },
};

test('one h1, one action, eager image', () => {
  render(<Hero {...props} />);
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  expect(screen.getByRole('link', { name: 'Shop the collection' })).toHaveAttribute('data-variant', 'on-dark');
  expect(screen.getByRole('img')).toHaveAttribute('fetchpriority', 'high');
});

test('frame shape comes from the theme', () => {
  const { rerender, container } = render(<Hero {...props} />);
  expect(container.querySelector('[data-media]')).toHaveAttribute('data-media', 'rect');
  rerender(<ThemeProvider themeId="warm-craft"><Hero {...props} /></ThemeProvider>);
  expect(container.querySelector('[data-media]')).toHaveAttribute('data-media', 'arch');
});

test('is accessible', async () => {
  const { container } = render(<Hero {...props} />);
  await expectNoAxeViolations(container);
});
