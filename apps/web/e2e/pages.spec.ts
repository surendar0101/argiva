import { expect, test } from '@playwright/test';
import { expectHealthyPage } from './page-health';

const COLLECTIONS = [
  'chains-and-pendants',
  'earrings',
  'bangles-and-bracelets',
  'anklets',
  'rings',
  'silver-gifting',
];
const POLICIES = [
  'terms',
  'privacy',
  'shipping',
  'returns',
  'cancellation',
  'care',
  'cookies',
  'contact-disclosures',
];
const PAGES = [
  '/',
  '/collections',
  ...COLLECTIONS.map((slug) => `/collections/${slug}`),
  '/products/test-fixed-chain',
  '/products/test-second-chain',
  '/products/test-rate-anklet',
  '/cart',
  '/search',
  '/search?q=Test',
  '/our-story',
  '/faq',
  '/contact',
  ...POLICIES.map((slug) => `/policies/${slug}`),
];

for (const path of PAGES) {
  test(`${path} loads without faults`, async ({ page }) => {
    await expectHealthyPage(page, path);
  });
}

for (const path of ['/robots.txt', '/sitemap.xml']) {
  test(`${path} is served`, async ({ request }) => {
    expect((await request.get(path)).status()).toBe(200);
  });
}

test('no internal link leads to an error', async ({ page, request, baseURL }) => {
  test.slow();
  const links = new Map<string, string>();
  for (const path of PAGES) {
    await page.goto(path);
    const hrefs = await page.locator('a[href]').evaluateAll((anchors) =>
      anchors.map((anchor) => (anchor as HTMLAnchorElement).href),
    );
    for (const href of hrefs) {
      const target = new URL(href);
      if (target.origin === new URL(baseURL!).origin) links.set(target.pathname + target.search, path);
    }
  }

  const broken: string[] = [];
  for (const [link, foundOn] of links) {
    const status = (await request.get(link)).status();
    if (status >= 400) broken.push(`${link} -> ${status} (on ${foundOn})`);
  }
  expect(links.size).toBeGreaterThan(20);
  expect(broken).toEqual([]);
});

test('a search made of special characters finds nothing and does not fail', async ({ page }) => {
  await expectHealthyPage(page, '/search?q=%25_%3Cscript%3E');
  await expect(page.getByText('No products match your search.')).toBeVisible();
});
