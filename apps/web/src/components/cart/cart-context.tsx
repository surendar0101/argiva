'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useSyncExternalStore } from 'react';

export interface CartItem {
  variantId: string;
  productName: string;
  variantName: string;
  pricePaise: number;
  quantity: number;
  imageUrl: string;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  totalPaise: number;
  totalCount: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 'argiva-cart';
const EMPTY_CART: CartItem[] = [];
const cartListeners = new Set<() => void>();

let cartItems: CartItem[] = EMPTY_CART;
let storedCart: string | null | undefined;
let storageUnavailable = false;
let storageWarningLogged = false;

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false;
  return (
    'variantId' in value &&
    typeof value.variantId === 'string' &&
    value.variantId.length > 0 &&
    'productName' in value &&
    typeof value.productName === 'string' &&
    value.productName.length > 0 &&
    'variantName' in value &&
    typeof value.variantName === 'string' &&
    value.variantName.length > 0 &&
    'pricePaise' in value &&
    typeof value.pricePaise === 'number' &&
    Number.isSafeInteger(value.pricePaise) &&
    value.pricePaise >= 0 &&
    'quantity' in value &&
    typeof value.quantity === 'number' &&
    Number.isSafeInteger(value.quantity) &&
    value.quantity > 0 &&
    Number.isSafeInteger(value.pricePaise * value.quantity) &&
    'imageUrl' in value &&
    typeof value.imageUrl === 'string'
  );
}

function parseCart(serialized: string | null): CartItem[] {
  if (!serialized) return EMPTY_CART;

  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized) as unknown;
  } catch (error) {
    console.warn('Malformed saved cart data was ignored.', error);
    return EMPTY_CART;
  }

  if (!Array.isArray(parsed)) {
    console.warn('Saved cart data was ignored because it is not an array.');
    return EMPTY_CART;
  }

  const validItems = parsed.filter(isCartItem);
  if (validItems.length !== parsed.length) {
    console.warn('Malformed saved cart entries were ignored.');
  }
  return validItems;
}

function warnStorageFailure(error: unknown): void {
  if (storageWarningLogged) return;
  storageWarningLogged = true;
  console.warn('Cart persistence is unavailable; changes will not survive reloads.', error);
}

function getCartSnapshot(): CartItem[] {
  if (typeof window === 'undefined') return EMPTY_CART;
  if (storageUnavailable) return cartItems;

  try {
    const serialized = window.localStorage.getItem(STORAGE_KEY);
    if (serialized !== storedCart) {
      cartItems = parseCart(serialized);
      storedCart = serialized;
    }
  } catch (error) {
    storageUnavailable = true;
    warnStorageFailure(error);
  }
  return cartItems;
}

function getServerCartSnapshot(): CartItem[] {
  return EMPTY_CART;
}

function subscribeToCart(listener: () => void): () => void {
  cartListeners.add(listener);
  return () => cartListeners.delete(listener);
}

function writeCart(items: CartItem[]): void {
  cartItems = items;
  if (typeof window !== 'undefined' && !storageUnavailable) {
    try {
      const serialized = JSON.stringify(items);
      window.localStorage.setItem(STORAGE_KEY, serialized);
      storedCart = serialized;
    } catch (error) {
      storageUnavailable = true;
      warnStorageFailure(error);
    }
  }
  cartListeners.forEach((listener) => listener());
}

function updateCart(update: (items: CartItem[]) => CartItem[]): void {
  writeCart(update(getCartSnapshot()));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribeToCart, getCartSnapshot, getServerCartSnapshot);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const addItem = (item: CartItem) => {
    updateCart((current) => {
      const existing = current.find((i) => i.variantId === item.variantId);
      if (existing) {
        return current.map((i) =>
          i.variantId === item.variantId ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...current, item];
    });
  };

  const removeItem = (variantId: string) => {
    updateCart((current) => current.filter((i) => i.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    updateCart((current) => current.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)));
  };

  const clearCart = () => {
    updateCart(() => EMPTY_CART);
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const totalPaise = items.reduce((sum, item) => sum + item.pricePaise * item.quantity, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalPaise,
        totalCount,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
