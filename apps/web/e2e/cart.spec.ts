import { expect, test } from '@playwright/test';

test('adding to the cart, using the drawer by keyboard and returning later', async ({ page }) => {
  await page.goto('/products/test-fixed-chain', { waitUntil: 'networkidle' });
  const addButton = page.getByRole('button', { name: 'Add to Cart' });
  const drawer = page.getByRole('dialog', { name: 'Your Cart' });
  const closeButton = drawer.getByRole('button', { name: 'Close cart' });

  await addButton.focus();
  await page.keyboard.press('Enter');
  await expect(drawer).toBeVisible();
  await expect(closeButton).toBeFocused();
  await expect(drawer).toContainText('Test Fixed Chain');

  // A modal dialog may hand focus to the browser itself, never to the page behind it.
  for (let press = 0; press < 10; press++) {
    await page.keyboard.press('Tab');
    const reachedPageBehind = await page.evaluate(() => {
      const active = document.activeElement;
      return active !== null && active !== document.body && !active.closest('dialog');
    });
    expect(reachedPageBehind, `after Tab ${press + 1}`).toBe(false);
  }

  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  await expect(addButton).toBeFocused();

  const headerCart = page.locator('header a[href="/cart"]');
  await headerCart.focus();
  await page.keyboard.press('Enter');
  await expect(drawer).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  await expect(headerCart).toBeFocused();

  await page.goto('/cart', { waitUntil: 'networkidle' });
  const summary = page.getByRole('region', { name: 'Order summary' });
  await expect(summary).toContainText('₹1,500');
  await expect(summary).toContainText('Online checkout is not available yet.');
  await expect(page.locator('a[href="/checkout"]')).toHaveCount(0);

  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'Test Fixed Chain' })).toBeVisible();
});

test('the drawer closes from its backdrop', async ({ page }) => {
  await page.goto('/products/test-fixed-chain', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Add to Cart' }).click();
  const drawer = page.getByRole('dialog', { name: 'Your Cart' });
  await expect(drawer).toBeVisible();

  await page.mouse.click(5, 300);

  await expect(drawer).toBeHidden();
});
