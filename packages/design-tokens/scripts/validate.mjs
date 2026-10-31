// Gate for every theme: manifest shape, token contract, references and WCAG contrast.
import { contrast, flatten, HEX, loadShared, loadThemes, resolve, THEME_ID } from './lib.mjs';

const TEXT = 4.5; // WCAG AA body text
const UI = 3; // WCAG AA non-text (focus rings, input borders)

const CONTRAST_PAIRS = [
  ['color.text.primary', 'color.surface.page', TEXT],
  ['color.text.primary', 'color.surface.raised', TEXT],
  ['color.text.primary', 'color.surface.muted', TEXT],
  ['color.text.muted', 'color.surface.page', TEXT],
  ['color.text.muted', 'color.surface.raised', TEXT],
  ['color.text.inverse', 'color.surface.inverse', TEXT],
  ['color.text.inverse', 'color.surface.inverse-raised', TEXT],
  ['color.text.inverse-muted', 'color.surface.inverse', TEXT],
  ['color.action.fg', 'color.action.bg', TEXT],
  ['color.action.fg', 'color.action.bg-hover', TEXT],
  ['color.action-inverse.fg', 'color.action-inverse.bg', TEXT],
  ['color.action-inverse.fg', 'color.action-inverse.bg-hover', TEXT],
  ['color.badge.fg', 'color.surface.page', TEXT],
  ['color.badge.fg', 'color.surface.raised', TEXT],
  ['color.selection.fg', 'color.selection.bg', TEXT],
  ['color.feedback.success', 'color.surface.page', TEXT],
  ['color.feedback.error', 'color.surface.page', TEXT],
  ['color.feedback.warning', 'color.surface.page', TEXT],
  ['color.focus.default', 'color.surface.page', UI],
  ['color.focus.default', 'color.surface.raised', UI],
  ['color.focus.inverse', 'color.surface.inverse', UI],
  ['color.border.strong', 'color.surface.raised', UI],
];

const ORNAMENTS = {
  purityBadge: ['hallmark', 'text'],
  divider: ['rule', 'ghungroo'],
  heroMedia: ['rect', 'arch'],
};

const errors = [];
const fail = (theme, msg) => errors.push(`[${theme}] ${msg}`);

const themes = loadThemes();
const { base, components } = loadShared();
const baseMap = flatten(base);
const componentMap = flatten(components);

if (themes.length === 0) errors.push('no themes found in tokens/themes/');

for (const { folder, manifest: m, tokens } of themes) {
  if (!m) { fail(folder, 'missing theme.json'); continue; }
  if (!tokens) { fail(folder, 'missing tokens.json'); continue; }
  if (m.id !== folder) fail(folder, `theme.json id "${m.id}" must equal folder name`);
  if (!THEME_ID.test(folder)) fail(folder, 'id must be lowercase kebab-case, 2-40 chars');
  for (const field of ['label', 'description']) {
    if (typeof m[field] !== 'string' || !m[field].trim()) fail(folder, `theme.json "${field}" is required`);
  }
  if (typeof m.default !== 'boolean') fail(folder, 'theme.json "default" must be true or false');
  if (!Array.isArray(m.fonts) || m.fonts.length === 0 || m.fonts.some((f) => typeof f.family !== 'string')) {
    fail(folder, 'theme.json "fonts" must list at least one { family, weights }');
  }
  for (const [key, allowed] of Object.entries(ORNAMENTS)) {
    if (!allowed.includes(m.ornaments?.[key])) fail(folder, `ornaments.${key} must be one of ${allowed.join(', ')}`);
  }
  if (!Array.isArray(m.ornaments?.dividerScope)) fail(folder, 'ornaments.dividerScope must be an array');
}

const defaults = themes.filter((t) => t.manifest?.default === true);
if (defaults.length !== 1) errors.push(`exactly one theme must have "default": true (found ${defaults.length})`);

// Contract: every theme must define the same semantic tokens as the default theme.
const reference = defaults[0] ?? themes[0];
const semanticKeys = (tokens) => [...flatten(tokens).keys()].filter((k) => !k.startsWith('palette.'));
const contract = reference?.tokens ? new Set(semanticKeys(reference.tokens)) : new Set();

for (const { folder, tokens } of themes) {
  if (!tokens) continue;
  const keys = new Set(semanticKeys(tokens));
  for (const k of contract) if (!keys.has(k)) fail(folder, `missing token ${k}`);
  for (const k of keys) if (!contract.has(k)) fail(folder, `unexpected token ${k} (add it to every theme or remove it)`);

  const map = new Map([...baseMap, ...flatten(tokens), ...componentMap]);
  for (const key of map.keys()) {
    try {
      const value = resolve(map, key);
      if (key.startsWith('palette.') || key.startsWith('color.')) {
        if (!HEX.test(value)) fail(folder, `${key} must be a hex colour, got "${value}"`);
      }
    } catch (e) {
      fail(folder, `${key}: ${e.message}`);
    }
  }

  for (const [fg, bg, min] of CONTRAST_PAIRS) {
    try {
      const a = resolve(map, fg);
      const b = resolve(map, bg);
      if (!HEX.test(a) || !HEX.test(b)) continue;
      const ratio = contrast(a, b);
      if (ratio < min) fail(folder, `contrast ${fg} (${a}) on ${bg} (${b}) is ${ratio.toFixed(2)}:1, needs ${min}:1`);
    } catch {
      // Missing tokens are already reported by the contract check.
    }
  }
}

if (errors.length) {
  console.error(`Design token validation failed (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`Design tokens valid: ${themes.length} themes, ${contract.size} semantic tokens each, ${CONTRAST_PAIRS.length} contrast checks per theme.`);
