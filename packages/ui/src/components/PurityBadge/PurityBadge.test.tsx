import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/axe';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { PurityBadge } from './PurityBadge';

test('hallmark variant in the default theme, solid for sterling', () => {
  render(<PurityBadge label="92.5% sterling silver" tone="sterling" />);
  const badge = screen.getByText('92.5% sterling silver');
  expect(badge).toHaveAttribute('data-variant', 'hallmark');
  expect(badge).toHaveAttribute('data-tone', 'sterling');
});

test('alloy tone is marked so it can be dashed', () => {
  render(<PurityBadge label="80% silver" tone="alloy" />);
  expect(screen.getByText('80% silver')).toHaveAttribute('data-tone', 'alloy');
});

test('text variant in warm-craft', () => {
  render(<ThemeProvider themeId="warm-craft"><PurityBadge label="60% silver" tone="alloy" /></ThemeProvider>);
  expect(screen.getByText('60% silver')).toHaveAttribute('data-variant', 'text');
});

test('is accessible', async () => {
  const { container } = render(<PurityBadge label="92.5% sterling silver" tone="sterling" />);
  await expectNoAxeViolations(container);
});
