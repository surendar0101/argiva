import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/axe';
import { ProductCard, type ProductCardProps } from './ProductCard';

const props: ProductCardProps = {
  href: '/products/ghungroo-payal',
  name: 'Ghungroo Payal',
  image: { src: '/p.svg', alt: 'Pair of silver anklets with small bells', width: 800, height: 1000 },
  pricePaise: 245000,
  weightGrams: 24.5,
  finish: 'Oxidised',
  purity: { label: '92.5% sterling silver', tone: 'sterling' },
};

test('shows the four facts: purity, weight, finish, price', () => {
  render(<ProductCard {...props} />);
  expect(screen.getByText('92.5% sterling silver')).toBeInTheDocument();
  expect(screen.getByText('24.5 g · Oxidised')).toBeInTheDocument();
  expect(screen.getByText('₹2,450')).toBeInTheDocument();
});

test('one link, named by the product', () => {
  render(<ProductCard {...props} />);
  const links = screen.getAllByRole('link');
  expect(links).toHaveLength(1);
  expect(links[0]).toHaveAccessibleName('Ghungroo Payal');
  expect(links[0]).toHaveAttribute('href', '/products/ghungroo-payal');
});

test('image keeps its intrinsic size and lazy-loads', () => {
  render(<ProductCard {...props} />);
  const img = screen.getByRole('img', { name: props.image.alt });
  expect(img).toHaveAttribute('width', '800');
  expect(img).toHaveAttribute('loading', 'lazy');
});

test('is accessible', async () => {
  const { container } = render(<ProductCard {...props} />);
  await expectNoAxeViolations(container);
});
