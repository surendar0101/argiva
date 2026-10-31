#!/usr/bin/env node
const [base, flag] = process.argv.slice(2);
if (!base) {
  console.error('usage: node scripts/smoke.mjs <baseUrl> [--noindex]');
  process.exit(2);
}
const url = (path) => new URL(path, base).toString();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function check(name, fn) {
  let lastError;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await fn();
      console.log(`ok   ${name}`);
      return true;
    } catch (error) {
      lastError = error;
      await sleep(2000);
    }
  }
  console.error(`FAIL ${name}: ${lastError?.message}`);
  return false;
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

const results = [
  await check('GET /api/health', async () => {
    const res = await fetch(url('/api/health'));
    expect(res.status === 200, `status ${res.status}`);
    expect((await res.json()).status === 'ok', 'status not ok');
  }),
  await check('GET /api/ready', async () => {
    const res = await fetch(url('/api/ready'));
    expect(res.status === 200, `status ${res.status}`);
    expect((await res.json()).db === 'ok', 'db not ok');
  }),
  await check('GET / (theme, heading, headers)', async () => {
    const res = await fetch(url('/'));
    expect(res.status === 200, `status ${res.status}`);
    const html = await res.text();
    expect(/<html[^>]*data-theme="[a-z-]+"/.test(html), 'no server-set data-theme');
    expect(html.includes('<h1'), 'no h1');
    expect((res.headers.get('content-security-policy') ?? '').includes("frame-ancestors 'none'"), 'CSP missing');
    expect(res.headers.get('x-content-type-options') === 'nosniff', 'nosniff missing');
    if (flag === '--noindex') expect(/<meta name="robots" content="noindex/.test(html), 'robots noindex missing');
  }),
  await check('GET / stylesheets ship web fonts', async () => {
    const html = await (await fetch(url('/'))).text();
    const hrefs = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs.length > 0, 'no stylesheets');
    const css = await Promise.all(hrefs.map(async (href) => (await fetch(url(href))).text()));
    expect(css.some((text) => text.includes('@font-face')), 'no @font-face rules');
  }),
];
process.exit(results.every(Boolean) ? 0 : 1);
