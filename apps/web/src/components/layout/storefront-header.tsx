'use client';

import { SiteHeader, type NavItem } from '@argiva/ui';
import { useEffect } from 'react';
import { useCart } from '../cart/cart-context';

const NAV_ITEMS: NavItem[] = [
  { href: '/search', label: 'Search' },
  { href: '/collections', label: 'Collections' },
  { href: '/our-story', label: 'Our Story' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

export function StorefrontHeader() {
  const { totalCount, openDrawer } = useCart();

  useEffect(() => {
    const handleCartClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const cartLink = target.closest('a[href="/cart"]');
      if (cartLink) {
        e.preventDefault();
        openDrawer();
      }
    };

    document.addEventListener('click', handleCartClick);
    return () => document.removeEventListener('click', handleCartClick);
  }, [openDrawer]);

  return <SiteHeader homeHref="/" nav={NAV_ITEMS} cartHref="/cart" cartCount={totalCount} />;
}
