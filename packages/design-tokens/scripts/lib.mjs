import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const TOKENS = path.join(ROOT, 'tokens');
export const THEMES_DIR = path.join(TOKENS, 'themes');
export const THEME_ID = /^[a-z][a-z0-9-]{1,39}$/;

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));

export function loadThemes() {
  return readdirSync(THEMES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const dir = path.join(THEMES_DIR, d.name);
      const manifestFile = path.join(dir, 'theme.json');
      const tokensFile = path.join(dir, 'tokens.json');
      return {
        folder: d.name,
        manifest: existsSync(manifestFile) ? readJson(manifestFile) : null,
        tokens: existsSync(tokensFile) ? readJson(tokensFile) : null,
      };
    })
    // Default theme first so its CSS block is emitted before the others.
    .sort((a, b) => Number(b.manifest?.default ?? 0) - Number(a.manifest?.default ?? 0) || a.folder.localeCompare(b.folder));
}

export function loadShared() {
  return {
    base: readJson(path.join(TOKENS, 'base', 'base.json')),
    components: readJson(path.join(TOKENS, 'components', 'components.json')),
  };
}

/** Flattens a DTCG tree into Map<"a.b.c", value>. */
export function flatten(tree, prefix = [], out = new Map()) {
  for (const [key, node] of Object.entries(tree)) {
    if (key.startsWith('$')) continue;
    const p = [...prefix, key];
    if (node && typeof node === 'object' && '$value' in node) out.set(p.join('.'), node.$value);
    else if (node && typeof node === 'object') flatten(node, p, out);
  }
  return out;
}

export function resolve(map, key, seen = []) {
  if (seen.includes(key)) throw new Error(`circular reference: ${[...seen, key].join(' -> ')}`);
  if (!map.has(key)) throw new Error(`unknown token {${key}}${seen.length ? ` (from ${seen[0]})` : ''}`);
  const value = String(map.get(key));
  const ref = value.match(/^\{([^}]+)\}$/);
  return ref ? resolve(map, ref[1], [...seen, key]) : value;
}

function luminance(hex) {
  const n = hex.replace('#', '');
  const full = n.length === 3 ? [...n].map((c) => c + c).join('') : n;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
