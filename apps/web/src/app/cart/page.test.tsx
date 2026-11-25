import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { CartProvider, type CartItem } from '../../components/cart/cart-context';
import CartPage from './page';

const item: CartItem = {
  variantId: 'variant-chain-20',
  productName: 'Classic Curb Silver Chain',
  variantName: '20 inch Chain',
  pricePaise: 125000,
  quantity: 1,
  imageUrl: '',
};

function renderCart(items: CartItem[] = []) {
  localStorage.setItem('argiva-cart', JSON.stringify(items));
  render(
    <CartProvider>
      <CartPage />
    </CartProvider>,
  );
}

describe('CartPage', () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  test('shows a useful empty-cart state with a collections link', () => {
    renderCart();

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Explore collections' })).toHaveAttribute('href', '/collections');
  });

  test('updates line quantity and subtotal', async () => {
    const user = userEvent.setup();
    renderCart([item]);
    const summary = screen.getByRole('region', { name: 'Order summary' });

    expect(summary).toHaveTextContent('₹1,250');
    await user.click(screen.getByRole('button', { name: 'Increase quantity for Classic Curb Silver Chain' }));

    expect(summary).toHaveTextContent('₹2,500');
  });

  test('says checkout is unavailable instead of linking to a missing page', () => {
    renderCart([item]);

    expect(document.querySelector('a[href="/checkout"]')).toBeNull();
    expect(screen.getByText('Online checkout is not available yet.')).toBeInTheDocument();
  });

  test('reserves space for cart item photography', () => {
    renderCart([{ ...item, imageUrl: '/test.jpg' }]);

    const image = screen.getByRole('img', { name: item.productName });
    expect(image).toHaveAttribute('width', '112');
    expect(image).toHaveAttribute('height', '112');
  });

  test('removing the only item returns to the empty-cart state', async () => {
    const user = userEvent.setup();
    renderCart([item]);

    await user.click(screen.getByRole('button', { name: 'Remove Classic Curb Silver Chain' }));

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });
});
