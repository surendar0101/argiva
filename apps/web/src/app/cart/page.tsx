'use client';

import { ButtonLink, Price } from '@argiva/ui';
import Image from 'next/image';
import { useCart } from '../../components/cart/cart-context';
import styles from './page.module.css';

export default function CartPage() {
  const { items, totalPaise, updateQuantity, removeItem } = useCart();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>ARGIVA Silvers</p>
        <h1>Your Cart</h1>
      </header>

      {items.length === 0 ? (
        <section className={styles.empty}>
          <h2>Your cart is empty</h2>
          <p>Find a piece that feels like you, or choose something special for someone you love.</p>
          <ButtonLink href="/collections">Explore collections</ButtonLink>
        </section>
      ) : (
        <div className={styles.layout}>
          <ul className={styles.items} aria-label="Cart items">
            {items.map((item) => (
              <li className={styles.item} key={item.variantId}>
                <article className={styles.itemDetails}>
                  {item.imageUrl ? (
                    <Image
                      className={styles.image}
                      src={item.imageUrl}
                      alt={item.productName}
                      width={112}
                      height={112}
                      unoptimized
                    />
                  ) : (
                    <div
                      className={`${styles.image} ${styles.imagePlaceholder}`}
                      role="img"
                      aria-label={`${item.productName} photograph coming soon`}
                    >
                      Photograph coming soon
                    </div>
                  )}
                  <div className={styles.product}>
                    <h2>{item.productName}</h2>
                    <p className={styles.variant}>{item.variantName}</p>
                    <p className={styles.unitPrice}>
                      <Price paise={item.pricePaise} /> <span>each</span>
                    </p>
                  </div>
                  <div className={styles.actions}>
                    <div className={styles.quantity} aria-label={`Quantity for ${item.productName}`}>
                      <button
                        type="button"
                        aria-label={`Decrease quantity for ${item.productName}`}
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span aria-live="polite">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase quantity for ${item.productName}`}
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      className={styles.remove}
                      type="button"
                      onClick={() => removeItem(item.variantId)}
                      aria-label={`Remove ${item.productName}`}
                    >
                      Remove
                    </button>
                  </div>
                  <p className={styles.lineTotal}>
                    <span>Item total</span>
                    <Price paise={item.pricePaise * item.quantity} />
                  </p>
                </article>
              </li>
            ))}
          </ul>

          <section className={styles.summary} aria-label="Order summary">
            <h2>Order summary</h2>
            <div className={styles.subtotal}>
              <span>Subtotal</span>
              <Price paise={totalPaise} />
            </div>
            <p className={styles.shippingNote}>
              Applicable shipping charges will be communicated or displayed before the order is confirmed.
            </p>
            <p className={styles.checkout}>Online checkout is not available yet.</p>
          </section>
        </div>
      )}
    </main>
  );
}
