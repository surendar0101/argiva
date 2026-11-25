import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findUndefinedVars } from './check-css-vars.mjs';

const defined = new Set(['--argiva-space-4', '--argiva-color-text-primary']);

test('flags an --argiva variable that no stylesheet defines', () => {
  assert.deepEqual(findUndefinedVars('a { padding: var(--argiva-spacing-4) }', defined), ['--argiva-spacing-4']);
});

test('allows defined variables, with or without spaces and fallbacks', () => {
  const css = 'a { padding: var( --argiva-space-4 ); color: var(--argiva-color-text-primary, inherit) }';
  assert.deepEqual(findUndefinedVars(css, defined), []);
});

test('flags an undefined variable used as a fallback', () => {
  const css = 'a { color: var(--argiva-color-text-primary, var(--argiva-text-primary)) }';
  assert.deepEqual(findUndefinedVars(css, defined), ['--argiva-text-primary']);
});

test('ignores component-local variables outside the --argiva namespace', () => {
  assert.deepEqual(findUndefinedVars('a { width: var(--gallery-width) }', defined), []);
});
