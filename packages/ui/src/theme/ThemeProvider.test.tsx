import { render, screen } from '@testing-library/react';
import { ThemeProvider, useThemeManifest } from './ThemeProvider';

function Probe() {
  const m = useThemeManifest();
  return <p>{`${m.id}|${m.ornaments.purityBadge}|${m.ornaments.heroMedia}`}</p>;
}

test('defaults to the default theme', () => {
  render(<Probe />);
  expect(screen.getByText('quiet-luxury|hallmark|rect')).toBeInTheDocument();
});

test('provides the chosen theme', () => {
  render(<ThemeProvider themeId="warm-craft"><Probe /></ThemeProvider>);
  expect(screen.getByText('warm-craft|text|arch')).toBeInTheDocument();
});
