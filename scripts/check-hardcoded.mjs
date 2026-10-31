#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RULES = [
  ['url', /\bhttps?:\/\/(?!localhost\b|127\.0\.0\.1\b|www\.w3\.org\/)[^\s'"`)<>]+/g],
  ['domain', /\bargivasilvers\.(?:com|in)\b/gi],
  ['email', /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g],
  ['phone', /(?<![\w.])(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}(?![\w.])/g],
  ['price', /(?:₹\s?\d|\bRs\.?\s?\d|\bINR\s?\d)/g],
];

const SKIP_DIRS = new Set(['node_modules', 'dist', '.next']);
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs']);

export function findHardcoded(text) {
  const findings = [];
  text.split('\n').forEach((content, index) => {
    if (content.includes('allow-hardcoded')) return;
    for (const [kind, pattern] of RULES) {
      for (const m of content.matchAll(pattern)) findings.push({ line: index + 1, kind, match: m[0] });
    }
  });
  return findings;
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else yield path;
  }
}

const isScanned = (file) =>
  EXTENSIONS.has(extname(file)) && !/\.test\./.test(file) && !file.endsWith('.d.ts');

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const roots = process.argv.slice(2).filter((r) => existsSync(r));
  let failures = 0;
  for (const root of roots) {
    for (const file of walk(root)) {
      if (!isScanned(file)) continue;
      for (const { line, kind, match } of findHardcoded(readFileSync(file, 'utf8'))) {
        console.error(`${file}:${line}: ${kind} "${match}"; read it from @argiva/config or site settings`);
        failures++;
      }
    }
  }
  process.exit(failures ? 1 : 0);
}
