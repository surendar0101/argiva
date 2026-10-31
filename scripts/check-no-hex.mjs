#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CSS_HEX = /(?<=[:\s,(])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g;
// Known limit: an anchor such as href="#add" (all hex letters) would also match; pick other ids.
const TS_HEX = /(?<=["'`])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?=["'`])/g;

export function findHexLiterals(text, kind) {
  return [...text.matchAll(kind === 'css' ? CSS_HEX : TS_HEX)].map((m) => m[0]);
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist') continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else yield path;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const roots = process.argv.slice(2).filter((r) => existsSync(r));
  let failures = 0;
  for (const root of roots) {
    for (const file of walk(root)) {
      const ext = extname(file);
      const kind = ext === '.css' ? 'css' : ['.ts', '.tsx'].includes(ext) ? 'ts' : null;
      if (!kind) continue;
      for (const hex of findHexLiterals(readFileSync(file, 'utf8'), kind)) {
        console.error(`${file}: hex colour ${hex}; use an --argiva-* variable`);
        failures++;
      }
    }
  }
  process.exit(failures ? 1 : 0);
}
