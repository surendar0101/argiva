const whole = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const withPaise = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });
const grams = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });

export function formatInr(paise: number): string {
  if (!Number.isSafeInteger(paise)) throw new RangeError(`paise must be a safe integer, got ${paise}`);
  return (paise % 100 === 0 ? whole : withPaise).format(paise / 100);
}

export function formatWeight(g: number): string {
  if (!(g > 0)) throw new RangeError(`weight must be positive, got ${g}`);
  return `${grams.format(g)} g`;
}
