import { getConfig } from '@argiva/config';
import type { MetadataRoute } from 'next';
import { getCategories, getPublishedProductSlugs } from '../lib/catalog';
import { getPolicySlugs } from '../lib/policies';

export const dynamic = 'force-dynamic';

function entry(
  path: string,
  baseUrl: string,
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>,
  priority: number,
): MetadataRoute.Sitemap[number] {
  return {
    url: new URL(path, baseUrl).toString(),
    changeFrequency,
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { baseUrl } = getConfig();
  const [categories, products, policySlugs] = await Promise.all([
    getCategories(),
    getPublishedProductSlugs(),
    getPolicySlugs(),
  ]);

  return [
    entry('/', baseUrl, 'weekly', 1),
    entry('/collections', baseUrl, 'weekly', 0.8),
    ...categories.map((category) =>
      entry(`/collections/${encodeURIComponent(category.slug)}`, baseUrl, 'weekly', 0.7),
    ),
    ...products.map((slug) => entry(`/products/${encodeURIComponent(slug)}`, baseUrl, 'weekly', 0.8)),
    ...policySlugs.map((slug) => entry(`/policies/${encodeURIComponent(slug)}`, baseUrl, 'monthly', 0.3)),
    entry('/our-story', baseUrl, 'monthly', 0.5),
    entry('/faq', baseUrl, 'monthly', 0.5),
    entry('/contact', baseUrl, 'monthly', 0.5),
  ];
}
