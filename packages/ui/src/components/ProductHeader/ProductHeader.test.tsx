import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/axe';
import { ProductHeader, type ProductHeaderProps } from './ProductHeader';

const props: ProductHeaderProps = {
  name: 'Ghungroo Payal',
  images: [
    { src: '/a.svg', alt: 'Anklet pair, front', width: 800, height: 1000 },
    { src: '/b.svg', alt: 'Anklet clasp, close-up', width: 800, height: 1000 },
  ],
  pricePaise: 245000,
  weightGrams: 24.5,
  finish: 'Oxidised',
  purity: { label: '92.5% sterling silver', tone: 'sterling' },
  addToCartLabel: 'Add to cart',
  onAddToCart: vi.fn(),
};

test('name is the h1 and facts are visible', () => {
  render(<ProductHeader {...props} />);
  expect(screen.getByRole('heading', { level: 1, name: 'Ghungroo Payal' })).toBeInTheDocument();
  expect(screen.getByText('92.5% sterling silver')).toBeInTheDocument();
  expect(screen.getByText('₹2,450')).toBeInTheDocument();
  expect(screen.getByText('24.5 g')).toBeInTheDocument();
  expect(screen.getByText('Oxidised')).toBeInTheDocument();
});

test('thumbnails switch the main image', async () => {
  render(<ProductHeader {...props} />);
  const second = screen.getByRole('button', { name: 'Show image 2: Anklet clasp, close-up' });
  expect(second).toHaveAttribute('aria-pressed', 'false');
  await userEvent.click(second);
  expect(second).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('img', { name: 'Anklet clasp, close-up' })).toBeInTheDocument();
});

test('add to cart calls back', async () => {
  const onAddToCart = vi.fn();
  render(<ProductHeader {...props} onAddToCart={onAddToCart} />);
  await userEvent.click(screen.getByRole('button', { name: 'Add to cart' }));
  expect(onAddToCart).toHaveBeenCalledOnce();
});

test('is accessible', async () => {
  const { container } = render(<ProductHeader {...props} />);
  await expectNoAxeViolations(container);
});
