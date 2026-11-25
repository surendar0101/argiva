import { getDb, policies } from '@argiva/db';
import { eq } from 'drizzle-orm';

export async function getPolicyBySlug(slug: string) {
  const [policy] = await getDb()
    .select({
      slug: policies.slug,
      title: policies.title,
      status: policies.status,
      content: policies.content,
    })
    .from(policies)
    .where(eq(policies.slug, slug))
    .limit(1);

  return policy ?? null;
}

export async function getPolicySlugs(): Promise<string[]> {
  const result = await getDb()
    .select({ slug: policies.slug })
    .from(policies)
    .orderBy(policies.slug);

  return result.map(({ slug }) => slug);
}
