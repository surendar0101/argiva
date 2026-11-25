// Rebuilds the two throwaway test databases and readies the built server.
import { cpSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { categories, getDb, policies, products, productVariants, seedDatabase } from '@argiva/db';
import { runMigrations } from '@argiva/db/migrate';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import { assertTestDatabaseUrl } from './database-guard';
import { databaseUrl, EMPTY_DATABASE, FULL_DATABASE, POSTGRES_URL } from './databases.mjs';

const webRoot = fileURLToPath(new URL('..', import.meta.url));

const TEST_PRODUCTS = [
  { name: 'Test Fixed Chain', category: 'chains-and-pendants', pricingMode: 'fixed', fixedPricePaise: 150000, finish: 'plain' },
  { name: 'Test Second Chain', category: 'chains-and-pendants', pricingMode: 'fixed', fixedPricePaise: 250000, finish: 'oxidised' },
  { name: 'Test Rate Anklet', category: 'anklets', pricingMode: 'silver_rate', fixedPricePaise: null, finish: 'oxidised' },
] as const;

async function recreate(name: string): Promise<void> {
  assertTestDatabaseUrl(databaseUrl(name));
  const admin = postgres(`${POSTGRES_URL}/postgres`, { max: 1, onnotice: () => {} });
  try {
    await admin`drop database if exists ${admin(name)} with (force)`;
    await admin`create database ${admin(name)}`;
  } finally {
    await admin.end();
  }
}

async function prepare(name: string): Promise<void> {
  await recreate(name);
  const url = databaseUrl(name);
  const db = getDb(url);

  // Twice on purpose: every deploy repeats both steps, so repeating them must change nothing.
  for (let round = 0; round < 2; round++) {
    await runMigrations(url);
    await seedDatabase(db);
  }

  const counts = [(await db.select().from(categories)).length, (await db.select().from(policies)).length];
  if (counts.join() !== '6,8') {
    throw new Error(`Reference data is wrong after repeating the seed: ${counts.join()} (expected 6,8)`);
  }
}

async function addTestProducts(): Promise<void> {
  const db = getDb(databaseUrl(FULL_DATABASE));

  for (const [index, item] of TEST_PRODUCTS.entries()) {
    const [category] = await db.select().from(categories).where(eq(categories.slug, item.category));
    if (!category) throw new Error(`Missing reference category ${item.category}`);

    const [product] = await db
      .insert(products)
      .values({
        categoryId: category.id,
        name: item.name,
        slug: item.name.toLowerCase().replaceAll(' ', '-'),
        description: 'A product that exists only in the browser tests.',
        status: 'published',
      })
      .returning({ id: products.id });

    await db.insert(productVariants).values({
      productId: product!.id,
      sku: `TEST-${index + 1}`,
      name: 'Standard',
      purity: '92.5',
      purityVerified: true,
      finish: item.finish,
      weightGrams: '10.00',
      pricingMode: item.pricingMode,
      fixedPricePaise: item.fixedPricePaise,
      stockQuantity: 5,
    });
  }
}

/** Next's standalone output leaves static files out; copy them beside the server. */
function copyStaticFiles(): void {
  const standalone = `${webRoot}.next/standalone/apps/web`;
  if (!existsSync(`${standalone}/server.js`)) {
    throw new Error('No production build found. Run `pnpm build` first.');
  }
  cpSync(`${webRoot}.next/static`, `${standalone}/.next/static`, { recursive: true });
  cpSync(`${webRoot}public`, `${standalone}/public`, { recursive: true });
}

copyStaticFiles();
await prepare(FULL_DATABASE);
await prepare(EMPTY_DATABASE);
await addTestProducts();
console.log('✓ Test databases ready');
// getDb(url) pools are not closed by closeDb(), so end the process explicitly.
process.exit(0);
