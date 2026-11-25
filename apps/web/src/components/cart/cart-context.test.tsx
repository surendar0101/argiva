import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { CartProvider, useCart } from './cart-context';

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('provides empty cart initially', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: ({ children }) => <CartProvider>{children}</CartProvider>,
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.totalPaise).toBe(0);
    expect(result.current.totalCount).toBe(0);
  });

  test('adds item to cart', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: ({ children }) => <CartProvider>{children}</CartProvider>,
    });

    act(() => {
      result.current.addItem({
        variantId: 'v1',
        productName: 'Silver Chain',
        variantName: '925 Sterling',
        pricePaise: 500000,
        quantity: 1,
        imageUrl: '/test.jpg',
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items).toMatchObject([{ variantId: 'v1' }]);
    expect(result.current.totalPaise).toBe(500000);
    expect(result.current.totalCount).toBe(1);
  });

  test('increments quantity for existing item', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: ({ children }) => <CartProvider>{children}</CartProvider>,
    });

    act(() => {
      result.current.addItem({
        variantId: 'v1',
        productName: 'Silver Chain',
        variantName: '925 Sterling',
        pricePaise: 500000,
        quantity: 1,
        imageUrl: '/test.jpg',
      });
    });

    act(() => {
      result.current.addItem({
        variantId: 'v1',
        productName: 'Silver Chain',
        variantName: '925 Sterling',
        pricePaise: 500000,
        quantity: 1,
        imageUrl: '/test.jpg',
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items).toMatchObject([{ quantity: 2 }]);
    expect(result.current.totalPaise).toBe(1000000);
    expect(result.current.totalCount).toBe(2);
  });

  test('updates quantity for item', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: ({ children }) => <CartProvider>{children}</CartProvider>,
    });

    act(() => {
      result.current.addItem({
        variantId: 'v1',
        productName: 'Silver Chain',
        variantName: '925 Sterling',
        pricePaise: 500000,
        quantity: 1,
        imageUrl: '/test.jpg',
      });
    });

    act(() => {
      result.current.updateQuantity('v1', 3);
    });

    expect(result.current.items).toMatchObject([{ quantity: 3 }]);
    expect(result.current.totalPaise).toBe(1500000);
    expect(result.current.totalCount).toBe(3);
  });

  test('removes item from cart', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: ({ children }) => <CartProvider>{children}</CartProvider>,
    });

    act(() => {
      result.current.addItem({
        variantId: 'v1',
        productName: 'Silver Chain',
        variantName: '925 Sterling',
        pricePaise: 500000,
        quantity: 1,
        imageUrl: '/test.jpg',
      });
    });

    act(() => {
      result.current.removeItem('v1');
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalPaise).toBe(0);
    expect(result.current.totalCount).toBe(0);
  });

  test('clears all items', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: ({ children }) => <CartProvider>{children}</CartProvider>,
    });

    act(() => {
      result.current.addItem({
        variantId: 'v1',
        productName: 'Silver Chain',
        variantName: '925 Sterling',
        pricePaise: 500000,
        quantity: 1,
        imageUrl: '/test.jpg',
      });
      result.current.addItem({
        variantId: 'v2',
        productName: 'Silver Bangle',
        variantName: '925 Sterling',
        pricePaise: 700000,
        quantity: 2,
        imageUrl: '/test2.jpg',
      });
    });

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalPaise).toBe(0);
  });

  test('syncs with localStorage', () => {
    const mockStorage: Record<string, string> = {};
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => mockStorage[key] ?? null);
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      mockStorage[key] = value;
    });

    const { result } = renderHook(() => useCart(), {
      wrapper: ({ children }) => <CartProvider>{children}</CartProvider>,
    });

    act(() => {
      result.current.addItem({
        variantId: 'v1',
        productName: 'Silver Chain',
        variantName: '925 Sterling',
        pricePaise: 500000,
        quantity: 1,
        imageUrl: '/test.jpg',
      });
    });

    expect(setItemSpy).toHaveBeenCalled();
    expect(mockStorage['argiva-cart']).toBeDefined();

    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
  });

  test('ignores malformed entries in a persisted cart', () => {
    const savedItem = {
      variantId: 'v1',
      productName: 'Silver Chain',
      variantName: '925 Sterling',
      pricePaise: 500000,
      quantity: 2,
      imageUrl: '/test.jpg',
    };
    localStorage.setItem('argiva-cart', JSON.stringify([savedItem, { ...savedItem, quantity: 'two' }]));

    const { result } = renderHook(() => useCart(), {
      wrapper: ({ children }) => <CartProvider>{children}</CartProvider>,
    });

    expect(result.current.items).toEqual([savedItem]);
    expect(result.current.totalCount).toBe(2);
  });

  test.each([
    ['a fractional price', { pricePaise: 10.5 }],
    ['a negative price', { pricePaise: -1 }],
    ['an unsafe price', { pricePaise: Number.MAX_SAFE_INTEGER + 1 }],
    ['an unsafe line total', { pricePaise: Number.MAX_SAFE_INTEGER, quantity: 2 }],
  ])('ignores a saved entry with %s', (_label, change) => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const free = {
      variantId: 'free',
      productName: 'Silver Chain',
      variantName: '925 Sterling',
      pricePaise: 0,
      quantity: 1,
      imageUrl: '',
    };
    localStorage.setItem('argiva-cart', JSON.stringify([free, { ...free, variantId: 'bad', ...change }]));

    const { result } = renderHook(() => useCart(), {
      wrapper: ({ children }) => <CartProvider>{children}</CartProvider>,
    });

    expect(result.current.items).toEqual([free]);
    expect(warning).toHaveBeenCalled();
  });

  test('warns and starts with an empty cart when saved JSON is malformed', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    localStorage.setItem('argiva-cart', '{');

    const { result } = renderHook(() => useCart(), {
      wrapper: ({ children }) => <CartProvider>{children}</CartProvider>,
    });

    expect(result.current.items).toEqual([]);
    expect(warning).toHaveBeenCalled();
  });

  test('keeps cart changes in memory when localStorage writes are unavailable', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage is disabled');
    });
    const item = {
      variantId: 'v1',
      productName: 'Silver Chain',
      variantName: '925 Sterling',
      pricePaise: 500000,
      quantity: 1,
      imageUrl: '/test.jpg',
    };
    const { result } = renderHook(() => useCart(), {
      wrapper: ({ children }) => <CartProvider>{children}</CartProvider>,
    });

    act(() => {
      result.current.addItem(item);
    });

    expect(result.current.items).toEqual([item]);
    expect(result.current.totalCount).toBe(1);
    expect(warning).toHaveBeenCalled();
  });

  test('opens and closes drawer', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: ({ children }) => <CartProvider>{children}</CartProvider>,
    });

    expect(result.current.isDrawerOpen).toBe(false);

    act(() => {
      result.current.openDrawer();
    });

    expect(result.current.isDrawerOpen).toBe(true);

    act(() => {
      result.current.closeDrawer();
    });

    expect(result.current.isDrawerOpen).toBe(false);
  });
});
