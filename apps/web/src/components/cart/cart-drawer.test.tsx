import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { CartProvider, useCart } from './cart-context';
import { CartDrawer } from './cart-drawer';

function CartDrawerHarness() {
  const { addItem, openDrawer } = useCart();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          addItem({
            variantId: 'v1',
            productName: 'Silver Chain',
            variantName: '925 Sterling',
            pricePaise: 500000,
            quantity: 1,
            imageUrl: '/test.jpg',
          });
          openDrawer();
        }}
      >
        Open cart
      </button>
      <CartDrawer />
    </>
  );
}

describe('CartDrawer', () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  test('reserves space for cart item photography', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <CartDrawerHarness />
      </CartProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Open cart' }));

    const image = screen.getByRole('img', { name: 'Silver Chain' });
    expect(image).toHaveAttribute('width', '80');
    expect(image).toHaveAttribute('height', '80');
  });
});
