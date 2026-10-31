import type { ProductCardProps } from '@argiva/ui';

const img = (name: string, alt: string) => ({ src: `/placeholders/${name}.svg`, alt, width: 800, height: 1000 });

export const products: ProductCardProps[] = [
  { href: '#', name: 'Ghungroo Payal', image: img('anklet', 'Placeholder: pair of anklets'), pricePaise: 245000, weightGrams: 24.5, finish: 'Oxidised', purity: { label: '92.5% sterling silver', tone: 'sterling' } },
  { href: '#', name: 'Leaf Pendant Chain', image: img('pendant', 'Placeholder: pendant on a chain'), pricePaise: 189900, weightGrams: 9.2, finish: 'Plain', purity: { label: '80% silver', tone: 'alloy' } },
  { href: '#', name: 'Everyday Toe Rings', image: img('anklet', 'Placeholder: pair of toe rings'), pricePaise: 64900, weightGrams: 4.1, finish: 'Plain', purity: { label: '60% silver', tone: 'alloy' } },
  { href: '#', name: 'Rose Finish Bangle', image: img('pendant', 'Placeholder: bangle'), pricePaise: 312050, weightGrams: 31.75, finish: 'Rose-gold finish on silver', purity: { label: '92.5% sterling silver', tone: 'sterling' } },
];
