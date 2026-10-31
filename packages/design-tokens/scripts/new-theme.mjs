// Usage: pnpm tokens:new <new-id> [--from <existing-id>]
// Copies an existing theme as the starting point for a rebrand.
import { cpSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { THEMES_DIR, THEME_ID, loadThemes } from './lib.mjs';

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith('--'));
const fromIndex = args.indexOf('--from');
const from = fromIndex >= 0 ? args[fromIndex + 1] : loadThemes().find((t) => t.manifest?.default)?.folder;

if (!id || !THEME_ID.test(id)) {
  console.error('Usage: pnpm tokens:new <new-id> [--from <existing-id>]\n<new-id> must be lowercase kebab-case, e.g. festive-2027');
  process.exit(1);
}
const target = path.join(THEMES_DIR, id);
const source = path.join(THEMES_DIR, from ?? '');
if (existsSync(target)) {
  console.error(`Theme "${id}" already exists.`);
  process.exit(1);
}
if (!from || !existsSync(source)) {
  console.error(`Source theme "${from}" not found.`);
  process.exit(1);
}

cpSync(source, target, { recursive: true });
const manifestFile = path.join(target, 'theme.json');
const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
Object.assign(manifest, {
  id,
  label: id.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' '),
  description: `TODO: describe this theme (copied from ${from}).`,
  default: false,
});
writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Created tokens/themes/${id}/ from ${from}.
Next:
  1. Edit tokens/themes/${id}/tokens.json (palette first, then semantic tokens) and theme.json (label, fonts, ornaments).
  2. Run pnpm tokens:build and fix any contrast or contract errors.
  3. Open packages/design-tokens/dist/preview.html#${id} to review.
  4. Deploy; the theme then appears in Admin > Appearance.`);
