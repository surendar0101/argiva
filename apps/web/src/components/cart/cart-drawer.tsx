'use client';

import { formatInr } from '@argiva/ui';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from './cart-context';
import styles from './cart-drawer.module.css';

export function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, updateQuantity, removeItem, totalPaise } = useCart();

  if (!isDrawerOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={closeDrawer} />
      <aside className={styles.drawer} role="dialog" aria-label="Shopping cart">
        <div className={styles.header}>
          <h2 className={styles.title}>Your Cart</h2>
          <button className={styles.closeButton} onClick={closeDrawer} aria-label="Close cart">
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <p>Your cart is empty</p>
            <Link href="/collections" className={styles.shopLink} onClick={closeDrawer}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.items}>
              {items.map((item) => (
                <div key={item.variantId} className={styles.item}>
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      className={styles.itemImage}
                      width={80}
                      height={80}
                      unoptimized
                    />
                  ) : (
                    <div
                      className={`${styles.itemImage} ${styles.itemImagePlaceholder}`}
                      role="img"
                      aria-label={`${item.productName} photograph coming soon`}
                    >
                      Photograph coming soon
                    </div>
                  )}
                  <div className={styles.itemDetails}>
                    <h3 className={styles.itemName}>{item.productName}</h3>
                    <p className={styles.itemVariant}>{item.variantName}</p>
                    <p className={styles.itemPrice}>{formatInr(item.pricePaise)}</p>
                  </div>
                  <div className={styles.itemActions}>
                    <div className={styles.quantity}>
                      <button
                        className={styles.quantityButton}
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className={styles.quantityValue}>{item.quantity}</span>
                      <button
                        className={styles.quantityButton}
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      className={styles.removeButton}
                      onClick={() => removeItem(item.variantId)}
                      aria-label="Remove item"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <div className={styles.subtotal}>
                <span>Subtotal</span>
                <span className={styles.subtotalAmount}>{formatInr(totalPaise)}</span>
              </div>
              <p className={styles.shippingNote}>Shipping calculated at checkout</p>
              <Link href="/cart" className={styles.viewCartButton} onClick={closeDrawer}>
                View Cart
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
