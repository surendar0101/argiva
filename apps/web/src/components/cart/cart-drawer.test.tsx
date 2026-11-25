import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
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

  test('uses the approved shipping wording', async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <CartDrawerHarness />
      </CartProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Open cart' }));

    expect(
      screen.getByText('Applicable shipping charges will be communicated or displayed before the order is confirmed.'),
    ).toBeInTheDocument();
  });

  async function openCart() {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <CartDrawerHarness />
      </CartProvider>,
    );
    const opener = screen.getByRole('button', { name: 'Open cart' });
    await user.click(opener);
    return { user, opener, dialog: screen.getByRole('dialog', { name: 'Your Cart' }) };
  }

  test('opens as a modal dialog with focus on the close button', async () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal');
    const { dialog } = await openCart();

    expect(showModal).toHaveBeenCalled();
    expect(dialog).toHaveAttribute('open');
    expect(screen.getByRole('button', { name: 'Close cart' })).toHaveFocus();
    showModal.mockRestore();
  });

  test('returns focus to the opening control when closed', async () => {
    const { user, opener } = await openCart();

    await user.click(screen.getByRole('button', { name: 'Close cart' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  test('closes on Escape and can be opened again', async () => {
    const { user, opener, dialog } = await openCart();

    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();

    await user.click(opener);
    expect(screen.getByRole('dialog', { name: 'Your Cart' })).toBeInTheDocument();
  });

  test('closes on a backdrop click but not on a click inside', async () => {
    const { user, dialog } = await openCart();

    await user.click(screen.getByRole('heading', { name: 'Your Cart' }));
    expect(dialog).toHaveAttribute('open');

    fireEvent.click(dialog);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
