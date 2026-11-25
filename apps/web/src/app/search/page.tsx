import { generateCompositionLabel } from '@argiva/domain';
import { Button, ProductCard } from '@argiva/ui';
import { getSearchProducts } from '../../lib/catalog';
import styles from './page.module.css';

interface SearchPageProps {
  searchParams: Promise<{ q?: string | string[] }>;
}

function getFinishLabel(finish: 'plain' | 'oxidised' | 'rose_gold'): string {
  return finish === 'rose_gold' ? 'Rose Gold' : finish === 'oxidised' ? 'Oxidised' : 'Plain';
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const rawQuery = Array.isArray(params.q) ? params.q[0] ?? '' : params.q ?? '';
  const query = rawQuery.trim();
  const products = query ? await getSearchProducts(query) : [];

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Search silver</h1>
      </header>

      <form className={styles.searchForm} action="/search" method="get" role="search">
        <label htmlFor="search-query">Search products</label>
        <div className={styles.searchControls}>
          <input
            id="search-query"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search by product, finish, silver composition or SKU"
            autoComplete="off"
          />
          <Button type="submit">Search</Button>
        </div>
      </form>

      {!query ? (
        <p className={styles.status} role="status">
          Enter a product name, finish, silver composition or SKU to search.
        </p>
      ) : products.length === 0 ? (
        <p className={styles.status} role="status">
          No products match your search.
        </p>
      ) : (
        <section className={styles.results} aria-label={`Search results for ${query}`}>
          <h2>Search results</h2>
          <ul className={styles.grid}>
            {products.map((product) => (
              <li key={product.id}>
                <ProductCard
                  href={`/products/${product.slug}`}
                  name={product.name}
                  pricePaise={product.pricePaise}
                  weightGrams={product.weightGrams}
                  finish={getFinishLabel(product.finish)}
                  purity={{
                    label: generateCompositionLabel({
                      purity: product.purity,
                      purityVerified: product.purityVerified,
                      finish: product.finish,
                    }),
                    tone: product.purity === '92.5' && product.purityVerified ? 'sterling' : 'alloy',
                  }}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
