#!/usr/bin/env node
// Fails when a stylesheet uses an --argiva-* variable that no stylesheet defines.
// The browser silently drops such declarations, which leaves elements unstyled.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const USE = /var\(\s*(--argiva-[\w-]+)/g;
const DEFINITION = /(--argiva-[\w-]+)\s*:/g;
const TOKEN_CSS = 'packages/design-tokens/dist/css';

export function findUndefinedVars(css, defined) {
  return [...css.matchAll(USE)].map((m) => m[1]).filter((name) => !defined.has(name));
}

function* cssFiles(dir) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next') continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* cssFiles(path);
    else if (extname(path) === '.css') yield path;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (!existsSync(TOKEN_CSS)) {
    console.error(`${TOKEN_CSS} is missing; run "pnpm tokens:build" first`);
    process.exit(1);
  }
  const files = process.argv
    .slice(2)
    .filter((root) => existsSync(root))
    .flatMap((root) => [...cssFiles(root)]);
  const defined = new Set(
    [...cssFiles(TOKEN_CSS), ...files].flatMap((file) =>
      [...readFileSync(file, 'utf8').matchAll(DEFINITION)].map((m) => m[1]),
    ),
  );
  let failures = 0;
  for (const file of files) {
    for (const name of findUndefinedVars(readFileSync(file, 'utf8'), defined)) {
      console.error(`${file}: undefined variable ${name}`);
      failures++;
    }
  }
  if (failures) console.error(`${failures} undefined variable reference(s)`);
  process.exit(failures ? 1 : 0);
}
