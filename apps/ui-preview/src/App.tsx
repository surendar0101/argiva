import { isThemeId, themeIds, type ThemeId } from '@argiva/design-tokens';
import { Divider, Hero, ProductCard, ProductHeader, SiteHeader, ThemeProvider } from '@argiva/ui';
import { useEffect, useState } from 'react';
import styles from './App.module.css';
import { products } from './fixtures';

const fromHash = (): ThemeId => {
  const h = location.hash.slice(1);
  return isThemeId(h) ? h : 'quiet-luxury';
};

export function App() {
  const [theme, setTheme] = useState<ThemeId>(fromHash);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    history.replaceState(null, '', `#${theme}`);
  }, [theme]);
  const first = products[0]!;

  return (
    <ThemeProvider themeId={theme}>
      <div className={styles.toolbar}>
        <label>
          Theme{' '}
          <select value={theme} onChange={(e) => setTheme(e.target.value as ThemeId)}>
            {themeIds.map((id) => <option key={id} value={id}>{id}</option>)}
          </select>
        </label>
      </div>
      <SiteHeader homeHref="#" nav={[{ href: '#collections', label: 'Collections' }, { href: '#our-story', label: 'Our Story' }]} cartHref="#" cartCount={0} />
      <main>
        <Hero
          title="Modern Silver. Timeless Stories."
          body="Placeholder hero text. Final copy comes from docs/brand-content.md."
          action={{ href: '#', label: 'Shop the collection' }}
          image={{ src: '/placeholders/anklet.svg', alt: 'Placeholder: anklet', width: 800, height: 1000 }}
        />
        <section className={styles.section} aria-labelledby="grid-title">
          <h2 id="grid-title" className={styles.sectionTitle}>Anklets</h2>
          <Divider context={{ collection: 'anklets' }} />
          <div className={styles.grid}>
            {products.map((p) => <ProductCard key={p.name} {...p} />)}
          </div>
        </section>
        <ProductHeader
          name={first.name}
          images={[first.image, products[1]!.image]}
          pricePaise={first.pricePaise}
          weightGrams={first.weightGrams}
          finish={first.finish}
          purity={first.purity}
          addToCartLabel="Add to cart"
          onAddToCart={() => undefined}
        />
      </main>
    </ThemeProvider>
  );
}
