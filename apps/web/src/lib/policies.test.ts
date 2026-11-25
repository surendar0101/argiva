import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getPolicyBySlug, getPolicySlugs } from './policies';

const mockState = vi.hoisted(() => ({
  rows: [] as Array<{
    slug: string;
    title: string;
    status: 'draft' | 'published';
    content: Array<{ type: 'paragraph'; text: string }>;
  }>,
  condition: undefined as { column: unknown; value: string } | undefined,
  orderBy: undefined as string | undefined,
  limit: 0,
}));

vi.mock('@argiva/db', () => {
  const limit = vi.fn(() => {
    mockState.limit += 1;
    return Promise.resolve(mockState.rows);
  });
  const where = vi.fn((condition: { column: unknown; value: string }) => {
    mockState.condition = condition;
    return { limit, orderBy };
  });
  const orderBy = vi.fn((column: string) => {
    mockState.orderBy = column;
    return Promise.resolve([...mockState.rows].sort((left, right) => left.slug.localeCompare(right.slug)));
  });
  const from = vi.fn(() => ({ where, orderBy }));
  const select = vi.fn(() => ({ from }));

  return {
    getDb: vi.fn(() => ({ select })),
    policies: {
      slug: 'policies.slug',
      title: 'policies.title',
      status: 'policies.status',
      content: 'policies.content',
    },
  };
});

vi.mock('drizzle-orm', () => ({
  eq: (column: unknown, value: string) => ({ column, value }),
}));

beforeEach(() => {
  mockState.rows = [];
  mockState.condition = undefined;
  mockState.orderBy = undefined;
  mockState.limit = 0;
});

describe('getPolicyBySlug', () => {
  test('returns a stored draft policy selected by slug', async () => {
    const policy = {
      slug: 'shipping',
      title: 'Shipping & Delivery',
      status: 'draft' as const,
      content: [{ type: 'paragraph' as const, text: 'Approved draft copy.' }],
    };
    mockState.rows = [policy];

    await expect(getPolicyBySlug('shipping')).resolves.toEqual(policy);
    expect(mockState.condition).toEqual({ column: 'policies.slug', value: 'shipping' });
    expect(mockState.limit).toBe(1);
  });

  test('returns null when no policy uses the requested slug', async () => {
    await expect(getPolicyBySlug('missing')).resolves.toBeNull();
  });

  test('lists existing policy slugs in a stable order regardless of draft status', async () => {
    mockState.rows = [
      {
        slug: 'terms',
        title: 'Terms & Conditions',
        status: 'draft',
        content: [{ type: 'paragraph', text: 'Draft.' }],
      },
      {
        slug: 'shipping',
        title: 'Shipping & Delivery',
        status: 'published',
        content: [{ type: 'paragraph', text: 'Published.' }],
      },
    ];

    await expect(getPolicySlugs()).resolves.toEqual(['shipping', 'terms']);
    expect(mockState.orderBy).toBe('policies.slug');
  });
});
