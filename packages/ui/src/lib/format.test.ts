import { formatInr, formatWeight } from './format';

describe('formatInr', () => {
  test('whole rupees have no decimals', () => expect(formatInr(245000)).toBe('₹2,450'));
  test('uses Indian digit grouping and keeps paise', () => expect(formatInr(12345678)).toBe('₹1,23,456.78'));
  test('zero', () => expect(formatInr(0)).toBe('₹0'));
  test('rejects fractional paise', () => expect(() => formatInr(1.5)).toThrow(RangeError));
});

describe('formatWeight', () => {
  test('up to two decimals with unit', () => expect(formatWeight(12.4)).toBe('12.4 g'));
  test('rounds to two decimals', () => expect(formatWeight(3.456)).toBe('3.46 g'));
  test('rejects non-positive', () => expect(() => formatWeight(0)).toThrow(RangeError));
});
