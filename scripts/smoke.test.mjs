import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./smoke.mjs', import.meta.url));

const pages = {
  '/api/health': { body: JSON.stringify({ status: 'ok' }) },
  '/api/ready': { body: JSON.stringify({ db: 'ok' }) },
  '/': {
    body: '<html data-theme="quiet-luxury"><link rel="stylesheet" href="/site.css"><h1>Home</h1></html>',
    headers: { 'content-security-policy': "frame-ancestors 'none'", 'x-content-type-options': 'nosniff' },
  },
  '/site.css': { body: '@font-face {}' },
  '/collections': { body: '<h1>Collections</h1>' },
  '/policies/shipping': { body: '<h1>Shipping &amp; Delivery</h1>' },
  '/search?q=silver': { body: '<h1>Search silver</h1>' },
};

async function runSmoke(missing) {
  const server = createServer((request, response) => {
    const page = request.url === missing ? undefined : pages[request.url];
    response.writeHead(page ? 200 : 404, page?.headers);
    response.end(page?.body ?? 'not found');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const child = spawn(process.execPath, [script, `http://127.0.0.1:${server.address().port}`]);
    let output = '';
    child.stdout.on('data', (chunk) => (output += chunk));
    child.stderr.on('data', (chunk) => (output += chunk));
    const status = await new Promise((resolve) => child.on('close', resolve));
    return { status, output };
  } finally {
    server.close();
  }
}

test('passes when every checked page answers', { timeout: 60_000 }, async () => {
  const { status, output } = await runSmoke();
  assert.equal(status, 0, output);
  for (const path of ['/collections', '/policies/shipping', '/search']) {
    assert.match(output, new RegExp(`ok\\s+GET ${path}`));
  }
});

test('fails when a database-backed policy page is missing', { timeout: 60_000 }, async () => {
  const { status, output } = await runSmoke('/policies/shipping');
  assert.equal(status, 1, output);
  assert.match(output, /FAIL GET \/policies\/shipping/);
});
