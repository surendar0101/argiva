import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  getCategories,
  getCategoryBySlug,
  getProductBySlug,
  getPublishedProductSlugs,
  getProductsByCategory,
  getSearchProducts,
} from './catalog';

const { fixtures } = vi.hoisted(() => ({
  fixtures: {
    categories: [] as Array<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      isActive: boolean;
    }>,
    products: [] as Array<{
      id: string;
      categoryId: string;
      name: string;
      slug: string;
      description: string;
      careInstructions: string | null;
      returnEligibility: string | null;
      searchTitle?: string | null;
      metaDescription?: string | null;
      status: string;
      categoryName: string;
      categorySlug: string;
      categoryIsActive: boolean;
    }>,
    silverRates: [] as Array<{ status: string; ratePerGramPaise: number }>,
    variants: [] as Array<{
      id: string;
      productId: string;
      sku: string;
      name: string;
      dimensions: string | null;
      stockQuantity: number;
      isPair: boolean;
      displayOrder: number;
      productName: string;
      productSlug: string;
      categoryId: string;
      productStatus: string;
      productDescription: string;
      categoryName: string;
      categoryIsActive: boolean;
      purity: '92.5' | '80' | '60' | 'other';
      purityVerified: boolean;
      finish: 'plain' | 'oxidised' | 'rose_gold';
      weightGrams: string;
      pricingMode: 'fixed' | 'silver_rate';
      fixedPricePaise: number | null;
      makingChargesPaise: number;
      isActive: boolean;
    }>,
  },
}));

vi.mock('@argiva/db', () => {
  const categories = {
    __name: 'categories',
    id: 'categories.id',
    name: 'categories.name',
    slug: 'categories.slug',
    description: 'categories.description',
    isActive: 'categories.isActive',
    displayOrder: 'categories.displayOrder',
  };
  const products = {
    __name: 'products',
    id: 'products.id',
    categoryId: 'products.categoryId',
    name: 'products.name',
    slug: 'products.slug',
    status: 'products.status',
    description: 'products.description',
    careInstructions: 'products.careInstructions',
    returnEligibility: 'products.returnEligibility',
  };
  const productVariants = {
    __name: 'productVariants',
    id: 'productVariants.id',
    productId: 'productVariants.productId',
    sku: 'productVariants.sku',
    name: 'productVariants.name',
    dimensions: 'productVariants.dimensions',
    stockQuantity: 'productVariants.stockQuantity',
    isPair: 'productVariants.isPair',
    displayOrder: 'productVariants.displayOrder',
    purity: 'productVariants.purity',
    finish: 'productVariants.finish',
    weightGrams: 'productVariants.weightGrams',
    pricingMode: 'productVariants.pricingMode',
    fixedPricePaise: 'productVariants.fixedPricePaise',
    makingChargesPaise: 'productVariants.makingChargesPaise',
    purityVerified: 'productVariants.purityVerified',
    isActive: 'productVariants.isActive',
  };
  const silverRates = {
    __name: 'silverRates',
    ratePerGramPaise: 'silverRates.ratePerGramPaise',
    status: 'silverRates.status',
    effectiveDate: 'silverRates.effectiveDate',
  };

  class Query {
    tableName = '';
    conditions: unknown;

    from(table: { __name: string }) {
      this.tableName = table.__name;
      return this;
    }

    innerJoin() {
      return this;
    }

    where(conditions: unknown) {
      this.conditions = conditions;
      return this;
    }

    orderBy() {
      return this;
    }

    limit(count: number) {
      return Promise.resolve(this.rows().slice(0, count));
    }

    then(
      onFulfilled: (value: unknown[]) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) {
      return Promise.resolve(this.rows()).then(onFulfilled, onRejected);
    }

    private rows(): unknown[] {
      const source =
        this.tableName === 'categories'
          ? fixtures.categories
          : this.tableName === 'products'
            ? fixtures.products
          : this.tableName === 'silverRates'
            ? fixtures.silverRates
            : fixtures.variants;

      return source.filter((row) => matches(row, this.conditions));
    }
  }

  const db = { select: () => new Query() };
  return { getDb: vi.fn(() => db), categories, products, productVariants, silverRates };
});

vi.mock('drizzle-orm', () => ({
  and: (...conditions: unknown[]) => conditions,
  desc: (column: unknown) => column,
  eq: (column: string, value: unknown) => ({ column, value }),
  ilike: (column: string, pattern: string) => ({ column, pattern }),
  or: (...conditions: unknown[]) => ({ or: conditions }),
}));

function matches(row: object, conditions: unknown): boolean {
  if (Array.isArray(conditions)) {
    return conditions.every((condition) => matches(row, condition));
  }
  if (!conditions || typeof conditions !== 'object') {
    return true;
  }

  if ('or' in conditions && Array.isArray(conditions.or)) {
    return conditions.or.some((condition) => matches(row, condition));
  }
  if ('pattern' in conditions && typeof conditions.pattern === 'string' && 'column' in conditions) {
    const column = conditions.column as string;
    const query = conditions.pattern.replace(/^%|%$/g, '').replace(/\\([\\%_])/g, '$1').toLowerCase();
    const key = column.split('.').at(-1);
    const rowKey =
      column === 'products.name' && 'productName' in row
        ? 'productName'
        : column === 'products.description' && 'productDescription' in row
          ? 'productDescription'
          : column === 'categories.name' && 'categoryName' in row
            ? 'categoryName'
            : key;
    const value: unknown = rowKey === undefined ? undefined : Reflect.get(row, rowKey);
    return typeof value === 'string' && value.toLowerCase().includes(query);
  }
  if (!('column' in conditions) || typeof conditions.column !== 'string' || !('value' in conditions)) {
    return true;
  }

  const { column, value } = conditions;
  if (column === 'categories.isActive' && 'categoryIsActive' in row) {
    return Reflect.get(row, 'categoryIsActive') === value;
  }
  const key = column.split('.').at(-1);
  if (key === 'categoryId' && 'productName' in row) {
    return Reflect.get(row, 'categoryId') === value;
  }
  if (key === 'status' && 'productStatus' in row) {
    return Reflect.get(row, 'productStatus') === value;
  }
  return key !== undefined && Reflect.get(row, key) === value;
}

const categories = [
  {
    id: 'category-chains',
    name: 'Chains & Pendants',
    slug: 'chains-and-pendants',
    description: 'Silver chains and pendants.',
    isActive: true,
  },
  {
    id: 'category-inactive',
    name: 'Inactive category',
    slug: 'inactive',
    description: null,
    isActive: false,
  },
];

const variants: (typeof fixtures.variants)[number][] = [
  {
    id: 'variant-silver-rate',
    productId: 'product-silver-rate',
    sku: 'CHN-CRB-925',
    name: '20 inch Chain',
    dimensions: null,
    stockQuantity: 20,
    isPair: false,
    displayOrder: 1,
    productName: 'Classic Curb Silver Chain',
    productSlug: 'classic-curb-silver-chain',
    categoryId: 'category-chains',
    productStatus: 'published',
    productDescription: 'Precision-crafted sterling silver curb chain with secure lobster clasp.',
    categoryName: 'Chains & Pendants',
    categoryIsActive: true,
    purity: '92.5',
    purityVerified: true,
    finish: 'plain',
    weightGrams: '18.20',
    pricingMode: 'silver_rate',
    fixedPricePaise: null,
    makingChargesPaise: 45000,
    isActive: true,
  },
  {
    id: 'variant-fixed',
    productId: 'product-fixed',
    sku: 'CHN-OXD-800',
    name: 'Size 2.4',
    dimensions: '2.4',
    stockQuantity: 8,
    isPair: false,
    displayOrder: 1,
    productName: 'Oxidised Silver Chain',
    productSlug: 'oxidised-silver-chain',
    categoryId: 'category-chains',
    productStatus: 'published',
    productDescription: 'An oxidised silver chain.',
    categoryName: 'Chains & Pendants',
    categoryIsActive: true,
    purity: '80',
    purityVerified: false,
    finish: 'oxidised',
    weightGrams: '12.50',
    pricingMode: 'fixed',
    fixedPricePaise: 179900,
    makingChargesPaise: 0,
    isActive: true,
  },
  {
    id: 'variant-rose-gold',
    productId: 'product-fixed',
    sku: 'CHN-ROSE-800',
    name: '13 inch Chain',
    dimensions: null,
    stockQuantity: 4,
    isPair: false,
    displayOrder: 2,
    productName: 'Oxidised Silver Chain',
    productSlug: 'oxidised-silver-chain',
    categoryId: 'category-chains',
    productStatus: 'published',
    productDescription: 'An oxidised silver chain.',
    categoryName: 'Chains & Pendants',
    categoryIsActive: true,
    purity: '80',
    purityVerified: false,
    finish: 'rose_gold',
    weightGrams: '13.50',
    pricingMode: 'fixed',
    fixedPricePaise: 199900,
    makingChargesPaise: 0,
    isActive: true,
  },
  {
    id: 'variant-other-category',
    productId: 'product-other-category',
    sku: 'ERR-STU-925',
    name: 'Classic Stud Pair',
    dimensions: null,
    stockQuantity: 35,
    isPair: true,
    displayOrder: 1,
    productName: 'Silver Studs',
    productSlug: 'silver-studs',
    categoryId: 'category-other',
    productStatus: 'published',
    productDescription: 'Silver studs.',
    categoryName: 'Earrings',
    categoryIsActive: false,
    purity: '92.5',
    purityVerified: true,
    finish: 'plain',
    weightGrams: '4.80',
    pricingMode: 'fixed',
    fixedPricePaise: 99000,
    makingChargesPaise: 0,
    isActive: true,
  },
];

const products = [
  {
    id: 'product-silver-rate',
    categoryId: 'category-chains',
    name: 'Classic Curb Silver Chain',
    slug: 'classic-curb-silver-chain',
    description: 'Precision-crafted sterling silver curb chain with secure lobster clasp.',
    careInstructions: 'Clean gently with a soft microfibre cloth.',
    returnEligibility: 'Replacement only for reported transit damage within 2 days with unboxing video.',
    searchTitle: 'Classic Curb Silver Chain | ARGIVA Silvers',
    metaDescription: 'A precision-crafted silver curb chain for everyday wear.',
    status: 'published',
    categoryName: 'Chains & Pendants',
    categorySlug: 'chains-and-pendants',
    categoryIsActive: true,
  },
  {
    id: 'product-fixed',
    categoryId: 'category-chains',
    name: 'Oxidised Silver Chain',
    slug: 'oxidised-silver-chain',
    description: 'An oxidised silver chain.',
    careInstructions: null,
    returnEligibility: null,
    searchTitle: null,
    metaDescription: null,
    status: 'published',
    categoryName: 'Chains & Pendants',
    categorySlug: 'chains-and-pendants',
    categoryIsActive: true,
  },
  {
    id: 'product-other-category',
    categoryId: 'category-other',
    name: 'Silver Studs',
    slug: 'silver-studs',
    description: 'Silver studs.',
    careInstructions: null,
    returnEligibility: null,
    searchTitle: null,
    metaDescription: null,
    status: 'published',
    categoryName: 'Earrings',
    categorySlug: 'earrings',
    categoryIsActive: false,
  },
];

beforeEach(() => {
  fixtures.categories.splice(0, fixtures.categories.length, ...structuredClone(categories));
  fixtures.products.splice(0, fixtures.products.length, ...structuredClone(products));
  fixtures.silverRates.splice(
    0,
    fixtures.silverRates.length,
    { status: 'approved', ratePerGramPaise: 9850 },
  );
  fixtures.variants.splice(0, fixtures.variants.length, ...structuredClone(variants));
});

describe('catalog', () => {
  test('returns only active categories', async () => {
    const result = await getCategories();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'category-chains',
      name: 'Chains & Pendants',
      slug: 'chains-and-pendants',
    });
  });

  test('lists published product slugs even when a silver rate is unavailable', async () => {
    fixtures.silverRates.length = 0;
    fixtures.products.push({
      id: 'product-draft',
      categoryId: 'category-chains',
      name: 'Draft Product',
      slug: 'draft-product',
      description: 'Not published.',
      careInstructions: null,
      returnEligibility: null,
      status: 'draft',
      categoryName: 'Chains & Pendants',
      categorySlug: 'chains-and-pendants',
      categoryIsActive: true,
    });

    await expect(getPublishedProductSlugs()).resolves.toEqual([
      'classic-curb-silver-chain',
      'oxidised-silver-chain',
    ]);
  });

  test('resolves a category by its active slug', async () => {
    const category = await getCategoryBySlug('chains-and-pendants');

    expect(category).toMatchObject({
      id: 'category-chains',
      slug: 'chains-and-pendants',
      name: 'Chains & Pendants',
    });
  });

  test('returns null for an unknown category slug', async () => {
    await expect(getCategoryBySlug('unknown-category')).resolves.toBeNull();
  });

  test('returns published product details with calculated active variant prices', async () => {
    const result = await getProductBySlug('classic-curb-silver-chain');

    expect(result).toMatchObject({
      id: 'product-silver-rate',
      name: 'Classic Curb Silver Chain',
      searchTitle: 'Classic Curb Silver Chain | ARGIVA Silvers',
      metaDescription: 'A precision-crafted silver curb chain for everyday wear.',
      category: { name: 'Chains & Pendants', slug: 'chains-and-pendants' },
      variants: [
        {
          id: 'variant-silver-rate',
          sku: 'CHN-CRB-925',
          name: '20 inch Chain',
          pricePaise: 210825,
          stockQuantity: 20,
        },
      ],
      pricingUnavailable: false,
    });
  });

  test('keeps silver-rate variants visible without a price when no approved rate exists', async () => {
    fixtures.silverRates.length = 0;

    const result = await getProductBySlug('classic-curb-silver-chain');

    expect(result).toMatchObject({
      pricingUnavailable: true,
      variants: [{ id: 'variant-silver-rate', pricePaise: null }],
    });
  });

  test('does not resolve products in inactive categories', async () => {
    await expect(getProductBySlug('silver-studs')).resolves.toBeNull();
  });

  test('returns product facts and a calculated price in paise', async () => {
    const result = await getProductsByCategory('category-chains');

    expect(result).toContainEqual({
      id: 'product-silver-rate',
      variantId: 'variant-silver-rate',
      name: 'Classic Curb Silver Chain',
      slug: 'classic-curb-silver-chain',
      pricePaise: 210825,
      purity: '92.5',
      purityVerified: true,
      finish: 'plain',
      weightGrams: 18.2,
    });
  });

  test('filters products by silver composition and finish', async () => {
    const sterlingProducts = await getProductsByCategory('category-chains', { purity: '92.5' });
    const oxidisedProducts = await getProductsByCategory('category-chains', { finish: 'oxidised' });

    expect(sterlingProducts.map((product) => product.id)).toEqual(['product-silver-rate']);
    expect(oxidisedProducts.map((product) => product.id)).toEqual(['product-fixed']);
  });

  test('applies inclusive minimum and maximum price filters', async () => {
    const result = await getProductsByCategory('category-chains', {
      minPricePaise: 179900,
      maxPricePaise: 210825,
    });

    expect(result.map((product) => product.pricePaise)).toEqual([210825, 179900]);
  });

  test('treats a zero maximum price as an active filter', async () => {
    await expect(
      getProductsByCategory('category-chains', { maxPricePaise: 0 }),
    ).resolves.toEqual([]);
  });

  test('returns no products when filters match nothing', async () => {
    await expect(
      getProductsByCategory('category-chains', {
        minPricePaise: 1,
        maxPricePaise: 10,
      }),
    ).resolves.toEqual([]);
  });

  test('omits silver-rate products if there is no approved rate', async () => {
    fixtures.silverRates.length = 0;

    const result = await getProductsByCategory('category-chains');

    expect(result.map((product) => product.id)).toEqual(['product-fixed']);
  });

  test('searches published active products by name, SKU, finish, purity, and category', async () => {
    const byName = await getSearchProducts('curb chain');
    const bySku = await getSearchProducts('chn-oxd-800');
    const byFinish = await getSearchProducts('oxidised');
    const byPurity = await getSearchProducts('80');
    const byCategory = await getSearchProducts('chains & pendants');
    const byDisplayFinish = await getSearchProducts('rose gold');
    const byPercentPurity = await getSearchProducts('92.5%');
    const byWildcard = await getSearchProducts('%');

    expect(byName.map((product) => product.id)).toEqual(['product-silver-rate']);
    expect(bySku.map((product) => product.id)).toEqual(['product-fixed']);
    expect(byFinish.map((product) => product.id)).toEqual(['product-fixed']);
    expect(byPurity.map((product) => product.id)).toEqual(['product-fixed']);
    expect(byCategory.map((product) => product.id)).toEqual(['product-silver-rate', 'product-fixed']);
    expect(byDisplayFinish.map((product) => product.id)).toEqual(['product-fixed']);
    expect(byPercentPurity.map((product) => product.id)).toEqual(['product-silver-rate']);
    expect(byWildcard).toEqual([]);
    expect(byCategory).not.toContainEqual(expect.objectContaining({ id: 'product-other-category' }));
  });

  test('returns no results for a blank search query', async () => {
    await expect(getSearchProducts('   ')).resolves.toEqual([]);
  });

  test('omits search results with unavailable silver-rate prices', async () => {
    fixtures.silverRates.length = 0;

    const result = await getSearchProducts('silver');

    expect(result.map((product) => product.id)).toEqual(['product-fixed']);
  });

  test('surfaces invalid fixed-price data instead of silently dropping it', async () => {
    const fixedVariant = variants.find((variant) => variant.id === 'variant-fixed');
    if (!fixedVariant) {
      throw new Error('Missing fixed-price test fixture');
    }

    fixtures.variants.splice(0, fixtures.variants.length, {
      ...fixedVariant,
      fixedPricePaise: 0,
    });

    await expect(getProductsByCategory('category-chains')).rejects.toThrow(
      'A valid positive integer fixed price in paise is required for fixed pricing mode',
    );
  });
});
