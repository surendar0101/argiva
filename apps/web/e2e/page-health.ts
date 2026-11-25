import { expect, type Page } from '@playwright/test';

/** Collects browser-side faults: console errors, crashes, failed requests and error responses. */
export function watchForFaults(page: Page): string[] {
  const faults: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') faults.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => faults.push(`page error: ${error.message}`));
  page.on('requestfailed', (request) => {
    const reason = request.failure()?.errorText ?? 'unknown';
    // Next.js cancels link prefetches when the page changes; that is not a fault.
    if (reason === 'net::ERR_ABORTED' && request.url().includes('_rsc')) return;
    faults.push(`request failed: ${request.url()} (${reason})`);
  });
  page.on('response', (response) => {
    if (response.status() >= 400) faults.push(`HTTP ${response.status()}: ${response.url()}`);
  });
  return faults;
}

export async function expectHealthyPage(page: Page, path: string): Promise<void> {
  const faults = watchForFaults(page);
  const response = await page.goto(path, { waitUntil: 'networkidle' });
  expect(response?.status(), path).toBe(200);
  await expect(page.locator('body')).not.toContainText('TODO(owner)');
  expect(faults, path).toEqual([]);
}
