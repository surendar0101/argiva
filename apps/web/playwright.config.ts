import { defineConfig, devices } from '@playwright/test';
import { EMPTY_DATABASE, FULL_DATABASE } from './e2e/databases.mjs';

const FULL_URL = 'http://127.0.0.1:3200';
const EMPTY_URL = 'http://127.0.0.1:3201';

const server = (url: string, database: string) => ({
  command: `node e2e/start-server.mjs ${new URL(url).port} ${database}`,
  url: `${url}/api/ready`,
  reuseExistingServer: false,
});

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { trace: 'retain-on-failure' },
  projects: [
    { name: 'phone', testIgnore: '**/empty-shop.spec.ts', use: { ...devices['Pixel 7'], baseURL: FULL_URL } },
    { name: 'desktop', testIgnore: '**/empty-shop.spec.ts', use: { ...devices['Desktop Chrome'], baseURL: FULL_URL } },
    { name: 'empty', testMatch: '**/empty-shop.spec.ts', use: { ...devices['Desktop Chrome'], baseURL: EMPTY_URL } },
  ],
  webServer: [server(FULL_URL, FULL_DATABASE), server(EMPTY_URL, EMPTY_DATABASE)],
});
