import { render, screen } from '@testing-library/react';
import { Price } from './Price';

test('shows formatted rupees and keeps paise as machine value', () => {
  render(<Price paise={245000} />);
  const el = screen.getByText('₹2,450');
  expect(el.tagName).toBe('DATA');
  expect(el).toHaveAttribute('value', '245000');
  expect(el).toHaveAttribute('data-size', 'md');
});
