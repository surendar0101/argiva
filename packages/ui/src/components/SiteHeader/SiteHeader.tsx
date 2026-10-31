'use client';
import { useId, useState } from 'react';
import styles from './SiteHeader.module.css';

export type NavItem = { href: string; label: string };

export function SiteHeader({ homeHref, nav, cartHref, cartCount }: { homeHref: string; nav: NavItem[]; cartHref: string; cartCount: number }) {
  const [open, setOpen] = useState(false);
  const navId = useId();
  return (
    <header className={styles.header}>
      <a href={homeHref} className={styles.wordmark}>ARGIVA</a>
      <button type="button" className={styles.menu} aria-expanded={open} aria-controls={navId} onClick={() => setOpen((o) => !o)}>
        Menu
      </button>
      <nav id={navId} aria-label="Main" data-open={open} className={styles.nav}>
        <ul>
          {nav.map((item) => (
            <li key={`${item.href}|${item.label}`}><a href={item.href}>{item.label}</a></li>
          ))}
        </ul>
      </nav>
      <a href={cartHref} className={styles.cart}>{`Cart (${cartCount})`}</a>
    </header>
  );
}
