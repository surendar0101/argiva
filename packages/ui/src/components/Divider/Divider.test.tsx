import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/axe';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { Divider } from './Divider';

test('default theme: ghungroo on Our Story', () => {
  render(<Divider context={{ page: 'our-story' }} />);
  expect(screen.getByRole('separator')).toHaveAttribute('data-kind', 'ghungroo');
});

test('default theme: ghungroo on the Anklets collection', () => {
  render(<Divider context={{ collection: 'anklets' }} />);
  expect(screen.getByRole('separator')).toHaveAttribute('data-kind', 'ghungroo');
});

test('default theme: plain rule elsewhere', () => {
  render(<Divider context={{ collection: 'rings' }} />);
  expect(screen.getByRole('separator')).toHaveAttribute('data-kind', 'rule');
});

test('modern-bold never shows the ghungroo', () => {
  render(<ThemeProvider themeId="modern-bold"><Divider context={{ page: 'our-story' }} /></ThemeProvider>);
  expect(screen.getByRole('separator')).toHaveAttribute('data-kind', 'rule');
});

test('is accessible', async () => {
  const { container } = render(<Divider context={{ page: 'our-story' }} />);
  await expectNoAxeViolations(container);
});
