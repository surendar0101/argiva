import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findHardcoded } from './check-hardcoded.mjs';

const kinds = (text) => findHardcoded(text).map((f) => f.kind);

test('flags absolute URLs and our own domain', () => {
  assert.deepEqual(kinds("const u = 'https://argivasilvers.com/shop';"), ['url', 'domain']);
  assert.deepEqual(kinds("fetch('https://api.example.org/x')"), ['url']);
});

test('allows localhost and the SVG namespace', () => {
  assert.deepEqual(kinds("const a = 'http://localhost:3000';"), []);
  assert.deepEqual(kinds('<svg xmlns="http://www.w3.org/2000/svg">'), []);
});

test('flags emails and Indian phone numbers', () => {
  assert.deepEqual(kinds("const e = 'hello@example.com';"), ['email']);
  assert.deepEqual(kinds("const p = '+91 98765 43210';"), ['phone']);
  assert.deepEqual(kinds('const p = 9876543210;'), ['phone']);
});

test('flags price literals', () => {
  assert.deepEqual(kinds('<span>₹1,299</span>'), ['price']);
  assert.deepEqual(kinds("const s = 'Rs. 500';"), ['price']);
  assert.deepEqual(kinds("const s = 'INR 500';"), ['price']);
});

test('ignores package imports, paise numbers and escaped lines', () => {
  assert.deepEqual(kinds("import { Button } from '@argiva/ui';"), []);
  assert.deepEqual(kinds('formatInr(129900)'), []);
  assert.deepEqual(kinds("const u = 'https://x.test'; // allow-hardcoded: test fixture"), []);
});

test('reports 1-based line numbers', () => {
  assert.equal(findHardcoded("a\nconst e = 'a@b.co';")[0].line, 2);
});
