import { expect, test, type Page } from '@playwright/test';

const product = (page: Page, name: string) => page.getByRole('link', { name, exact: true });

async function openChains(page: Page) {
  await page.goto('/collections/chains-and-pendants', { waitUntil: 'networkidle' });
  await expect(product(page, 'Test Fixed Chain')).toBeVisible();
  await expect(product(page, 'Test Second Chain')).toBeVisible();
}

test('the finish filter narrows the collection and can be cleared', async ({ page }) => {
  await openChains(page);

  await page.getByRole('button', { name: 'Plain', exact: true }).click();
  await expect(product(page, 'Test Fixed Chain')).toBeVisible();
  await expect(product(page, 'Test Second Chain')).toBeHidden();

  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(product(page, 'Test Second Chain')).toBeVisible();
});

test('the maximum price filter narrows the collection', async ({ page }) => {
  await openChains(page);

  await page.getByRole('spinbutton', { name: /Maximum price/ }).fill('2000');

  await expect(product(page, 'Test Fixed Chain')).toBeVisible();
  await expect(product(page, 'Test Second Chain')).toBeHidden();
});

test('a product without a confirmed price is listed but cannot be bought', async ({ page }) => {
  await page.goto('/collections/anklets', { waitUntil: 'networkidle' });
  await expect(product(page, 'Test Rate Anklet')).toBeVisible();
  await expect(page.getByText('Price unavailable')).toBeVisible();
  await expect(page.getByRole('group', { name: 'Price range in rupees' })).toHaveCount(0);

  await product(page, 'Test Rate Anklet').click();
  await expect(page.getByRole('heading', { level: 1, name: 'Test Rate Anklet' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add to Cart' })).toBeDisabled();
});

test('search finds products, including unpriced ones', async ({ page }) => {
  await page.goto('/search', { waitUntil: 'networkidle' });
  await page.getByRole('searchbox', { name: 'Search products' }).fill('Test');
  await page.getByRole('search').getByRole('button', { name: 'Search' }).click();

  for (const name of ['Test Fixed Chain', 'Test Second Chain', 'Test Rate Anklet']) {
    await expect(product(page, name)).toBeVisible();
  }
});
