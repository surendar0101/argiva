import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/axe';
import { SiteHeader } from './SiteHeader';

const nav = [{ href: '/collections', label: 'Collections' }, { href: '/our-story', label: 'Our Story' }];

test('wordmark links home', () => {
  render(<SiteHeader homeHref="/" nav={nav} cartHref="/cart" cartCount={2} />);
  expect(screen.getByRole('link', { name: 'ARGIVA' })).toHaveAttribute('href', '/');
});

test('cart link visible text equals its accessible name', () => {
  render(<SiteHeader homeHref="/" nav={nav} cartHref="/cart" cartCount={2} />);
  const cart = screen.getByRole('link', { name: 'Cart (2)' });
  expect(cart).toHaveTextContent('Cart (2)');
  expect(cart).not.toHaveAttribute('aria-label');
});

test('menu button toggles the nav', async () => {
  render(<SiteHeader homeHref="/" nav={nav} cartHref="/cart" cartCount={0} />);
  const btn = screen.getByRole('button', { name: 'Menu' });
  expect(btn).toHaveAttribute('aria-expanded', 'false');
  await userEvent.click(btn);
  expect(btn).toHaveAttribute('aria-expanded', 'true');
  expect(document.getElementById(btn.getAttribute('aria-controls')!)).toHaveAttribute('data-open', 'true');
});

test('is accessible', async () => {
  const { container } = render(<SiteHeader homeHref="/" nav={nav} cartHref="/cart" cartCount={0} />);
  await expectNoAxeViolations(container);
});
