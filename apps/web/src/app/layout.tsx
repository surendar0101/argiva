import { getConfig } from '@argiva/config';
import '@argiva/ui/fonts';
import '@argiva/ui/global.css';
import type { Metadata } from 'next';
import { connection } from 'next/server';
import type { ReactNode } from 'react';
import { CartDrawer } from '../components/cart/cart-drawer';
import { CartProvider } from '../components/cart/cart-context';
import { SiteFooter } from '../components/layout/site-footer';
import { StorefrontHeader } from '../components/layout/storefront-header';
import { buildOrganizationJsonLd, buildSiteMetadata, serializeJsonLd } from '../lib/seo';
import { ThemeProvider } from './theme-provider';

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const config = getConfig();
  return buildSiteMetadata(config.baseUrl, config.appEnv === 'production');
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  await connection();
  const config = getConfig();
  return (
    <html lang="en-IN" data-theme={config.defaultThemeId}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(buildOrganizationJsonLd(config.baseUrl, config.instagramUrl)),
          }}
        />
        <ThemeProvider themeId={config.defaultThemeId}>
          <CartProvider>
            <StorefrontHeader />
            {children}
            <CartDrawer />
            <SiteFooter />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
