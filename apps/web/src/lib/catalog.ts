import { getDb, categories, products, productVariants, silverRates } from '@argiva/db';
import { calculateVariantPrice, type FinishType, type PurityGrade } from '@argiva/domain';
import { eq, and, desc, ilike, or } from 'drizzle-orm';

export interface CatalogFilters {
  purity?: PurityGrade;
  finish?: FinishType;
  minPricePaise?: number;
  maxPricePaise?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface CatalogProduct {
  id: string;
  variantId: string;
  name: string;
  slug: string;
  pricePaise: number;
  purity: PurityGrade;
  purityVerified: boolean;
  finish: FinishType;
  weightGrams: number;
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  searchTitle: string | null;
  metaDescription: string | null;
  careInstructions: string | null;
  returnEligibility: string | null;
  category: Pick<Category, 'name' | 'slug'>;
  pricingUnavailable: boolean;
  variants: Array<{
    id: string;
    sku: string;
    name: string;
    purity: PurityGrade;
    purityVerified: boolean;
    finish: FinishType;
    weightGrams: number;
    dimensions: string | null;
    pricingMode: 'fixed' | 'silver_rate';
    pricePaise: number | null;
    stockQuantity: number;
    isPair: boolean;
  }>;
}

interface CatalogVariantRow {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  purity: PurityGrade;
  purityVerified: boolean;
  finish: FinishType;
  weightGrams: string;
  pricingMode: 'fixed' | 'silver_rate';
  fixedPricePaise: number | null;
  makingChargesPaise: number;
}

function toCatalogProducts(
  variants: CatalogVariantRow[],
  currentRatePaise: number | undefined,
  filters?: CatalogFilters,
): CatalogProduct[] {
  const productMap = new Map<string, CatalogProduct>();

  for (const variant of variants) {
    if (variant.pricingMode === 'silver_rate' && currentRatePaise === undefined) {
      continue;
    }

    const pricePaise = calculateVariantPrice(
      {
        pricingMode: variant.pricingMode,
        fixedPricePaise: variant.fixedPricePaise,
        makingChargesPaise: variant.makingChargesPaise,
        weightGrams: Number(variant.weightGrams),
        purity: variant.purity,
        purityVerified: variant.purityVerified,
      },
      currentRatePaise === undefined ? undefined : { ratePerGramPaise: currentRatePaise },
    ).finalPricePaise;

    if (filters?.purity && variant.purity !== filters.purity) continue;
    if (filters?.finish && variant.finish !== filters.finish) continue;
    if (filters?.minPricePaise !== undefined && pricePaise < filters.minPricePaise) continue;
    if (filters?.maxPricePaise !== undefined && pricePaise > filters.maxPricePaise) continue;

    const product: CatalogProduct = {
      id: variant.productId,
      variantId: variant.id,
      name: variant.productName,
      slug: variant.productSlug,
      pricePaise,
      purity: variant.purity,
      purityVerified: variant.purityVerified,
      finish: variant.finish,
      weightGrams: Number(variant.weightGrams),
    };
    const existing = productMap.get(product.id);
    if (!existing || product.pricePaise < existing.pricePaise) {
      productMap.set(product.id, product);
    }
  }

  return Array.from(productMap.values());
}

function makeSearchPattern(value: string): string {
  return `%${value.replace(/[\\%_]/g, '\\$&')}%`;
}

export async function getCategories(): Promise<Category[]> {
  const db = getDb();
  const result = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
    })
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(categories.displayOrder);
  
  return result;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const db = getDb();
  const result = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
    })
    .from(categories)
    .where(and(eq(categories.slug, slug), eq(categories.isActive, true)))
    .limit(1);
  
  return result[0] || null;
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const db = getDb();
  const [product] = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      searchTitle: products.searchTitle,
      metaDescription: products.metaDescription,
      careInstructions: products.careInstructions,
      returnEligibility: products.returnEligibility,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(
      eq(products.slug, slug),
      eq(products.status, 'published'),
      eq(categories.isActive, true),
    ))
    .limit(1);

  if (!product) {
    return null;
  }

  const [latestRate] = await db
    .select({ ratePerGramPaise: silverRates.ratePerGramPaise })
    .from(silverRates)
    .where(eq(silverRates.status, 'approved'))
    .orderBy(desc(silverRates.effectiveDate))
    .limit(1);

  const variants = await db
    .select({
      id: productVariants.id,
      sku: productVariants.sku,
      name: productVariants.name,
      purity: productVariants.purity,
      purityVerified: productVariants.purityVerified,
      finish: productVariants.finish,
      weightGrams: productVariants.weightGrams,
      dimensions: productVariants.dimensions,
      pricingMode: productVariants.pricingMode,
      fixedPricePaise: productVariants.fixedPricePaise,
      makingChargesPaise: productVariants.makingChargesPaise,
      stockQuantity: productVariants.stockQuantity,
      isPair: productVariants.isPair,
    })
    .from(productVariants)
    .where(and(
      eq(productVariants.productId, product.id),
      eq(productVariants.isActive, true),
    ))
    .orderBy(productVariants.displayOrder);

  const currentRatePaise = latestRate?.ratePerGramPaise;
  const pricedVariants = variants.map((variant) => {
    const pricePaise =
      variant.pricingMode === 'silver_rate' && currentRatePaise === undefined
        ? null
        : calculateVariantPrice(
            {
              pricingMode: variant.pricingMode,
              fixedPricePaise: variant.fixedPricePaise,
              makingChargesPaise: variant.makingChargesPaise,
              weightGrams: Number(variant.weightGrams),
              purity: variant.purity,
              purityVerified: variant.purityVerified,
            },
            currentRatePaise === undefined ? undefined : { ratePerGramPaise: currentRatePaise },
          ).finalPricePaise;

    return {
      id: variant.id,
      sku: variant.sku,
      name: variant.name,
      purity: variant.purity,
      purityVerified: variant.purityVerified,
      finish: variant.finish,
      weightGrams: Number(variant.weightGrams),
      dimensions: variant.dimensions,
      pricingMode: variant.pricingMode,
      pricePaise,
      stockQuantity: variant.stockQuantity,
      isPair: variant.isPair,
    };
  });

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    searchTitle: product.searchTitle,
    metaDescription: product.metaDescription,
    careInstructions: product.careInstructions,
    returnEligibility: product.returnEligibility,
    category: { name: product.categoryName, slug: product.categorySlug },
    pricingUnavailable: pricedVariants.some((variant) => variant.pricePaise === null),
    variants: pricedVariants,
  };
}

export async function getPublishedProductSlugs(): Promise<string[]> {
  const result = await getDb()
    .select({ slug: products.slug })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.status, 'published'), eq(categories.isActive, true)))
    .orderBy(products.slug);

  return result.map(({ slug }) => slug);
}

export async function getProductsByCategory(
  categoryId: string,
  filters?: CatalogFilters
): Promise<CatalogProduct[]> {
  const db = getDb();
  
  // Get the most recent approved silver rate
  const latestRateResult = await db
    .select({ ratePerGramPaise: silverRates.ratePerGramPaise })
    .from(silverRates)
    .where(eq(silverRates.status, 'approved'))
    .orderBy(desc(silverRates.effectiveDate))
    .limit(1);
  
  const currentRatePaise = latestRateResult[0]?.ratePerGramPaise;
  
  // Get all variants for products in this category
  const variants = await db
    .select({
      id: productVariants.id,
      productId: productVariants.productId,
      productName: products.name,
      productSlug: products.slug,
      purity: productVariants.purity,
      finish: productVariants.finish,
      weightGrams: productVariants.weightGrams,
      pricingMode: productVariants.pricingMode,
      fixedPricePaise: productVariants.fixedPricePaise,
      makingChargesPaise: productVariants.makingChargesPaise,
      purityVerified: productVariants.purityVerified,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(
      and(
        eq(products.categoryId, categoryId),
        eq(products.status, 'published'),
        eq(productVariants.isActive, true)
      )
    );

  return toCatalogProducts(variants, currentRatePaise, filters);
}

export async function getSearchProducts(searchTerm: string): Promise<CatalogProduct[]> {
  const query = searchTerm.trim();
  if (!query) {
    return [];
  }

  const db = getDb();
  const [latestRate] = await db
    .select({ ratePerGramPaise: silverRates.ratePerGramPaise })
    .from(silverRates)
    .where(eq(silverRates.status, 'approved'))
    .orderBy(desc(silverRates.effectiveDate))
    .limit(1);

  const pattern = makeSearchPattern(query);
  const finishPattern = makeSearchPattern(query.replace(/[\s-]+/g, '_'));
  const purityQuery = query.replace(/%+\s*$/, '').trim();
  const searchConditions = [
    ilike(products.name, pattern),
    ilike(products.description, pattern),
    ilike(categories.name, pattern),
    ilike(productVariants.name, pattern),
    ilike(productVariants.sku, pattern),
    ilike(productVariants.finish, finishPattern),
    ...(purityQuery ? [ilike(productVariants.purity, makeSearchPattern(purityQuery))] : []),
  ];
  const variants = await db
    .select({
      id: productVariants.id,
      productId: products.id,
      productName: products.name,
      productSlug: products.slug,
      purity: productVariants.purity,
      purityVerified: productVariants.purityVerified,
      finish: productVariants.finish,
      weightGrams: productVariants.weightGrams,
      pricingMode: productVariants.pricingMode,
      fixedPricePaise: productVariants.fixedPricePaise,
      makingChargesPaise: productVariants.makingChargesPaise,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(
      eq(products.status, 'published'),
      eq(productVariants.isActive, true),
      eq(categories.isActive, true),
      or(...searchConditions),
    ));

  return toCatalogProducts(variants, latestRate?.ratePerGramPaise);
}
