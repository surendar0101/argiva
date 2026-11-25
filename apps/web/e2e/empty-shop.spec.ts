import { expect, test } from '@playwright/test';
import { expectHealthyPage } from './page-health';

for (const path of ['/', '/collections', '/collections/anklets', '/search?q=silver', '/policies/shipping']) {
  test(`a shop with no products serves ${path}`, async ({ page }) => {
    await expectHealthyPage(page, path);
  });
}

test('an empty collection says so', async ({ page }) => {
  await page.goto('/collections/anklets');
  await expect(page.getByText('There are no products in this collection yet.')).toBeVisible();
});
