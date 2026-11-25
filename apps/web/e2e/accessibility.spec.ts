import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// Entrance animations fade text in, which would be measured as low contrast.
test.use({ contextOptions: { reducedMotion: 'reduce' } });

async function expectNoSeriousViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const serious = violations
    .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
    .map((violation) => ({
      rule: violation.id,
      elements: violation.nodes.map((node) => node.target.join(' ')),
    }));
  expect(serious).toEqual([]);
}

for (const path of [
  '/',
  '/collections/chains-and-pendants',
  '/products/test-fixed-chain',
  '/products/test-rate-anklet',
  '/cart',
  '/search?q=Test',
  '/contact',
  '/policies/shipping',
]) {
  test(`${path} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' });
    await expectNoSeriousViolations(page);
  });
}

test('the open cart drawer and a filled cart page have no serious violations', async ({ page }) => {
  await page.goto('/products/test-fixed-chain', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Add to Cart' }).click();
  await expect(page.getByRole('dialog', { name: 'Your Cart' })).toBeVisible();
  await expectNoSeriousViolations(page);

  await page.goto('/cart', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Test Fixed Chain' })).toBeVisible();
  await expectNoSeriousViolations(page);
});
