import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findHexLiterals } from './check-no-hex.mjs';

test('finds hex colours in CSS declarations', () => {
  assert.deepEqual(findHexLiterals('a { color: #1D2422; border: 1px solid #fff }', 'css'), ['#1D2422', '#fff']);
});

test('allows CSS variables', () => {
  assert.deepEqual(findHexLiterals('a { color: var(--argiva-color-text-primary) }', 'css'), []);
});

test('finds whole-string hex literals in TS', () => {
  assert.deepEqual(findHexLiterals(`const c = '#A7AEAB';`, 'ts'), ['#A7AEAB']);
});

test('ignores anchors that are not pure hex', () => {
  assert.deepEqual(findHexLiterals(`<a href="#main">`, 'ts'), []);
});
