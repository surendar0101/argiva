# Phase 1: Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking. **Never `git commit` or `git push`**; each task ends with a checkpoint instead (update `sdd/state.json`, then leave the change for the owner to review).

**Goal:** Build the shared screen components (`packages/ui`) and a preview app that shows the home hero, product card and product page header in all three themes, ready for the owner's design review.

**Architecture:**
- `packages/ui` is a React component library styled only with CSS Modules that read `--argiva-*` variables from `@argiva/design-tokens`.
- Theme-specific choices (badge style, divider, hero frame) come from the theme manifest through a small React context, never from `if theme === ...` checks.
- `apps/ui-preview` is a Vite app that composes the components with placeholder images and a theme switcher, used for screenshots and checks. The Next.js app arrives in Phase 2 and imports `@argiva/ui` unchanged.

**Tech stack:**
- React 19 and TypeScript (strict), with CSS Modules.
- Vitest, Testing Library, jsdom and axe-core for tests.
- Vite for the preview app; Fontsource packages for self-hosted fonts.

## Global constraints

- Package manager: `npx pnpm@12.16.1` (Corepack cannot download pnpm here). Below, `pnpm` means `npx pnpm@12.16.1`.
- Node `>=22`. The root `pnpm-workspace.yaml` already includes `apps/*` and `packages/*`.
- Components read colours, fonts, radii, spacing and motion only from `--argiva-*` CSS variables. No hex literals in `packages/ui/src` or `apps/ui-preview/src` (enforced in Task 2).
- No box-shadows, no gradients on UI surfaces, no glassmorphism (DESIGN.md No-Shadow Rule).
- Tap targets are at least `var(--argiva-size-tap-min)` (2.75rem). Focus rings are always visible.
- All motion is wrapped in `@media (prefers-reduced-motion: no-preference)`.
- Prices are integer paise and shown with `formatInr`. Prices, weights and percentages use `font-variant-numeric: tabular-nums` and weight 600 (Ledger Numerals Rule).
- The badge never decides its own text. It shows a label passed in. The composition rules ("925 only when verified") are built in Phase 3.
- The ghungroo divider shows only where the theme manifest's `dividerScope` allows it.
- Placeholder images only. Never third-party jewellery photos.
- Accessibility target: WCAG 2.2 AA.

## File structure

```
packages/ui/
  package.json, tsconfig.json, vitest.config.ts
  src/
    index.ts                  public exports
    test/setup.ts             jest-dom matchers
    test/axe.ts               expectNoAxeViolations()
    styles/global.css         reset, body type, focus ring, ledger numerals
    styles/fonts.ts           font imports per theme (preview only)
    lib/format.ts             formatInr(), formatWeight()
    lib/ornament-scope.ts     isInOrnamentScope()
    theme/ThemeProvider.tsx   manifest context + useThemeManifest()
    components/Button/        Button.tsx, Button.module.css, Button.test.tsx
    components/PurityBadge/   PurityBadge.tsx, .module.css, .test.tsx
    components/Price/         Price.tsx, .module.css, .test.tsx
    components/ProductCard/   ProductCard.tsx, .module.css, .test.tsx
    components/Divider/       Divider.tsx, Ghungroo.tsx, .module.css, .test.tsx
    components/SiteHeader/    SiteHeader.tsx, .module.css, .test.tsx
    components/Hero/          Hero.tsx, .module.css, .test.tsx
    components/ProductHeader/ ProductHeader.tsx, .module.css, .test.tsx
scripts/check-no-hex.mjs      fails on hex colour literals
scripts/check-no-hex.test.mjs
apps/ui-preview/
  package.json, vite.config.ts, index.html
  public/placeholders/*.svg
  src/main.tsx, src/App.tsx, src/fixtures.ts, src/App.module.css
docs/design/imagery.md        photo and placeholder rules
```

---

### Task 1: `packages/ui` package and test harness

**Files:**
- Create: `packages/ui/package.json`, `packages/ui/tsconfig.json`, `packages/ui/vitest.config.ts`, `packages/ui/src/test/setup.ts`, `packages/ui/src/test/axe.ts`, `packages/ui/src/index.ts`, `packages/ui/src/smoke.test.tsx`
- Create: `tsconfig.base.json` (repo root)
- Modify: `package.json` (root scripts)

**Interfaces:**
- Produces: `expectNoAxeViolations(container: Element): Promise<void>` from `src/test/axe.ts`; package name `@argiva/ui`.

- [ ] **Step 1: Create the package files**

`tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "verbatimModuleSyntax": true
  }
}
```

`packages/ui/package.json`:
```json
{
  "name": "@argiva/ui",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "sideEffects": ["**/*.css"],
  "exports": {
    ".": "./src/index.ts",
    "./global.css": "./src/styles/global.css",
    "./fonts": "./src/styles/fonts.ts"
  },
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  }
}
```

`packages/ui/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "types": ["vitest/globals", "@testing-library/jest-dom"] },
  "include": ["src", "vitest.config.ts", "src/**/*.d.ts"]
}
```

`packages/ui/vitest.config.ts`:
```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
});
```

`packages/ui/src/test/setup.ts`:
```ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => cleanup());
```

`packages/ui/src/test/axe.ts`:
```ts
import axe from 'axe-core';
import { expect } from 'vitest';

// WCAG rules only: page-level best-practice rules (region, page-has-heading-one) do not apply to isolated components.
// jsdom has no layout, so contrast is checked by the token build and the browser axe run instead.
export async function expectNoAxeViolations(container: Element): Promise<void> {
  const result = await axe.run(container, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    rules: { 'color-contrast': { enabled: false } },
  });
  const summary = result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
  expect(summary).toEqual([]);
}
```

`packages/ui/src/index.ts`:
```ts
export {};
```

- [ ] **Step 2: Install dependencies**

Run:
```bash
pnpm --filter @argiva/ui add react react-dom @argiva/design-tokens@workspace:*
pnpm --filter @argiva/ui add -D typescript vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom axe-core @types/react @types/react-dom
```
Expected: installs succeed and `pnpm-lock.yaml` updates.

- [ ] **Step 3: Write the smoke test**

`packages/ui/src/smoke.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from './test/axe';

test('harness renders React and runs axe', async () => {
  const { container } = render(<main><h1>ARGIVA</h1></main>);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('ARGIVA');
  await expectNoAxeViolations(container);
});
```

- [ ] **Step 4: Run the tests and type check**

Run: `pnpm --filter @argiva/ui test && pnpm --filter @argiva/ui typecheck`
Expected: 1 test passes; no type errors.

- [ ] **Step 5: Add root scripts**

In root `package.json` `scripts`, add:
```json
"ui:test": "pnpm --filter @argiva/ui test",
"ui:typecheck": "pnpm --filter @argiva/ui typecheck"
```

- [ ] **Step 6: Checkpoint.** Set the Task 1 todo in `sdd/state.json` to done and validate the JSON. Do not commit.

---

### Task 2: No-hex guard

**Files:**
- Create: `scripts/check-no-hex.mjs`, `scripts/check-no-hex.test.mjs`
- Modify: root `package.json` scripts

**Interfaces:**
- Produces: `findHexLiterals(text: string, kind: 'css' | 'ts'): string[]`; command `pnpm lint:no-hex`.

- [ ] **Step 1: Write the failing test**

`scripts/check-no-hex.test.mjs`:
```js
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
```

- [ ] **Step 2: Run it to see it fail**

Run: `node --test scripts/check-no-hex.test.mjs`
Expected: FAIL with "Cannot find module ... check-no-hex.mjs".

- [ ] **Step 3: Implement**

`scripts/check-no-hex.mjs`:
```js
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
```

- [ ] **Step 4: Run the tests**

Run: `node --test scripts/check-no-hex.test.mjs`
Expected: 4 tests pass.

- [ ] **Step 5: Add the root script**

```json
"lint:no-hex": "node scripts/check-no-hex.mjs packages/ui/src apps/ui-preview/src"
```
Run: `pnpm lint:no-hex` → exit code 0 (roots that do not exist yet, such as `apps/ui-preview/src`, are skipped).

- [ ] **Step 6: Checkpoint.** Update `sdd/state.json`. Do not commit.

---

### Task 3: Formatters and the ornament scope rule

**Files:**
- Create: `packages/ui/src/lib/format.ts`, `packages/ui/src/lib/format.test.ts`, `packages/ui/src/lib/ornament-scope.ts`, `packages/ui/src/lib/ornament-scope.test.ts`

**Interfaces:**
- Produces: `formatInr(paise: number): string`, `formatWeight(grams: number): string`, `type OrnamentContext = { page?: string; collection?: string }`, `isInOrnamentScope(scope: readonly string[], ctx: OrnamentContext): boolean`.

- [ ] **Step 1: Write the failing tests**

`packages/ui/src/lib/format.test.ts`:
```ts
import { formatInr, formatWeight } from './format';

describe('formatInr', () => {
  test('whole rupees have no decimals', () => expect(formatInr(245000)).toBe('₹2,450'));
  test('uses Indian digit grouping and keeps paise', () => expect(formatInr(12345678)).toBe('₹1,23,456.78'));
  test('zero', () => expect(formatInr(0)).toBe('₹0'));
  test('rejects fractional paise', () => expect(() => formatInr(1.5)).toThrow(RangeError));
});

describe('formatWeight', () => {
  test('up to two decimals with unit', () => expect(formatWeight(12.4)).toBe('12.4 g'));
  test('rounds to two decimals', () => expect(formatWeight(3.456)).toBe('3.46 g'));
  test('rejects non-positive', () => expect(() => formatWeight(0)).toThrow(RangeError));
});
```

`packages/ui/src/lib/ornament-scope.test.ts`:
```ts
import { isInOrnamentScope } from './ornament-scope';

test('"all" matches anywhere', () => expect(isInOrnamentScope(['all'], {})).toBe(true));
test('page match', () => expect(isInOrnamentScope(['page:our-story'], { page: 'our-story' })).toBe(true));
test('collection match', () => expect(isInOrnamentScope(['collection:anklets'], { collection: 'anklets' })).toBe(true));
test('no match elsewhere', () => expect(isInOrnamentScope(['page:our-story', 'collection:anklets'], { collection: 'rings' })).toBe(false));
test('empty scope never matches', () => expect(isInOrnamentScope([], { page: 'our-story' })).toBe(false));
```

- [ ] **Step 2: Run them to see them fail**

Run: `pnpm --filter @argiva/ui test src/lib`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement**

`packages/ui/src/lib/format.ts`:
```ts
const whole = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const withPaise = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });
const grams = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });

export function formatInr(paise: number): string {
  if (!Number.isSafeInteger(paise)) throw new RangeError(`paise must be a safe integer, got ${paise}`);
  return (paise % 100 === 0 ? whole : withPaise).format(paise / 100);
}

export function formatWeight(g: number): string {
  if (!(g > 0)) throw new RangeError(`weight must be positive, got ${g}`);
  return `${grams.format(g)} g`;
}
```

`packages/ui/src/lib/ornament-scope.ts`:
```ts
export type OrnamentContext = { page?: string; collection?: string };

export function isInOrnamentScope(scope: readonly string[], ctx: OrnamentContext): boolean {
  return scope.some(
    (s) =>
      s === 'all' ||
      (ctx.page !== undefined && s === `page:${ctx.page}`) ||
      (ctx.collection !== undefined && s === `collection:${ctx.collection}`),
  );
}
```

- [ ] **Step 4: Run the tests**

Run: `pnpm --filter @argiva/ui test src/lib`
Expected: 12 tests pass. If `formatInr` output contains a non-breaking space or a different symbol on this Node ICU build, print `JSON.stringify(formatInr(245000))`, and fix the code (not the test) so the output is exactly `₹2,450`.

- [ ] **Step 5: Export and checkpoint**

Add to `src/index.ts`:
```ts
export { formatInr, formatWeight } from './lib/format';
export { isInOrnamentScope, type OrnamentContext } from './lib/ornament-scope';
```
Update `sdd/state.json`. Do not commit.

---

### Task 4: Theme context, global styles and fonts

**Files:**
- Create: `packages/ui/src/theme/ThemeProvider.tsx`, `packages/ui/src/theme/ThemeProvider.test.tsx`, `packages/ui/src/styles/global.css`, `packages/ui/src/styles/fonts.ts`, `packages/ui/src/css-modules.d.ts`

**Interfaces:**
- Consumes: `getTheme`, `defaultThemeId`, `ThemeId`, `ThemeManifest` from `@argiva/design-tokens`.
- Produces: `ThemeProvider({ themeId?: ThemeId; children })`, `useThemeManifest(): ThemeManifest`. The app is responsible for setting `<html data-theme>`; the provider only supplies the manifest to components.

- [ ] **Step 1: Build the token package so its `dist` exists**

Run: `pnpm tokens:build`
Expected: validation passes; `packages/design-tokens/dist/index.js` exists.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/theme/ThemeProvider.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { ThemeProvider, useThemeManifest } from './ThemeProvider';

function Probe() {
  const m = useThemeManifest();
  return <p>{`${m.id}|${m.ornaments.purityBadge}|${m.ornaments.heroMedia}`}</p>;
}

test('defaults to the default theme', () => {
  render(<Probe />);
  expect(screen.getByText('quiet-luxury|hallmark|rect')).toBeInTheDocument();
});

test('provides the chosen theme', () => {
  render(<ThemeProvider themeId="warm-craft"><Probe /></ThemeProvider>);
  expect(screen.getByText('warm-craft|text|arch')).toBeInTheDocument();
});
```

- [ ] **Step 3: Run it to see it fail**

Run: `pnpm --filter @argiva/ui test src/theme`
Expected: FAIL, module not found.

- [ ] **Step 4: Implement**

`packages/ui/src/theme/ThemeProvider.tsx`:
```tsx
import { defaultThemeId, getTheme, type ThemeId, type ThemeManifest } from '@argiva/design-tokens';
import { createContext, useContext, type ReactNode } from 'react';

const ThemeContext = createContext<ThemeManifest>(getTheme(defaultThemeId));

export function ThemeProvider({ themeId = defaultThemeId, children }: { themeId?: ThemeId; children: ReactNode }) {
  return <ThemeContext.Provider value={getTheme(themeId)}>{children}</ThemeContext.Provider>;
}

export function useThemeManifest(): ThemeManifest {
  return useContext(ThemeContext);
}
```

`packages/ui/src/css-modules.d.ts`:
```ts
declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}
declare module '*.css';
```

`packages/ui/src/styles/global.css`:
```css
@import '@argiva/design-tokens/css';

*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  background: var(--argiva-color-surface-page);
  color: var(--argiva-color-text-primary);
  font-family: var(--argiva-font-family-body);
  font-weight: var(--argiva-font-weight-body);
  line-height: var(--argiva-font-line-height-body);
}
img, svg, video { display: block; max-width: 100%; }
h1, h2, h3 {
  font-family: var(--argiva-font-family-display);
  font-weight: var(--argiva-font-weight-display);
  font-stretch: var(--argiva-font-stretch-display);
  letter-spacing: var(--argiva-font-tracking-display);
  line-height: var(--argiva-font-line-height-snug);
  margin: 0;
}
:focus-visible {
  outline: 2px solid var(--argiva-color-focus-default);
  outline-offset: 2px;
}
::selection { background: var(--argiva-color-selection-bg); color: var(--argiva-color-selection-fg); }
.argiva-ledger { font-variant-numeric: tabular-nums; font-weight: var(--argiva-font-weight-strong); }
.argiva-visually-hidden {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}
@media (prefers-reduced-motion: no-preference) {
  html { scroll-behavior: smooth; }
}
```

`packages/ui/src/styles/fonts.ts` (the preview loads every theme's fonts; the Next.js app in Phase 2 loads only the active theme's):
```ts
import '@fontsource/marcellus/400.css';
import '@fontsource/hanken-grotesk/400.css';
import '@fontsource/hanken-grotesk/500.css';
import '@fontsource/hanken-grotesk/600.css';
import '@fontsource/rozha-one/400.css';
import '@fontsource/mukta/400.css';
import '@fontsource/mukta/500.css';
import '@fontsource/mukta/700.css';
import '@fontsource-variable/anybody/wdth.css';
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
```

- [ ] **Step 5: Install the fonts and check the file names**

Run:
```bash
pnpm --filter @argiva/ui add @fontsource/marcellus @fontsource/hanken-grotesk @fontsource/rozha-one @fontsource/mukta @fontsource-variable/anybody @fontsource/atkinson-hyperlegible
ls packages/ui/node_modules/@fontsource-variable/anybody
```
Expected: the listing contains `wdth.css`. If the width-axis file has another name, use that name in `fonts.ts`. Then check that the `font-family` names in those CSS files match the token values (for example `"Anybody Variable"` versus `Anybody`). If they differ, fix the theme's font token in `packages/design-tokens/tokens/themes/<id>/tokens.json` and run `pnpm tokens:build`.

- [ ] **Step 6: Run the tests and type check**

Run: `pnpm ui:test && pnpm ui:typecheck && pnpm lint:no-hex`
Expected: all pass.

- [ ] **Step 7: Export and checkpoint**

Add to `src/index.ts`:
```ts
export { ThemeProvider, useThemeManifest } from './theme/ThemeProvider';
```
Update `sdd/state.json`. Do not commit.

---

### Task 5: Button

**Files:**
- Create: `packages/ui/src/components/Button/Button.tsx`, `Button.module.css`, `Button.test.tsx`

**Interfaces:**
- Produces: `type ButtonVariant = 'primary' | 'on-dark' | 'outline'`; `Button(props: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant })`; `ButtonLink(props: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: ButtonVariant })`. Both set `data-variant`.

- [ ] **Step 1: Write the failing test**

`Button.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/axe';
import { Button, ButtonLink } from './Button';

test('defaults to primary type=button and fires onClick', async () => {
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Add to cart</Button>);
  const btn = screen.getByRole('button', { name: 'Add to cart' });
  expect(btn).toHaveAttribute('type', 'button');
  expect(btn).toHaveAttribute('data-variant', 'primary');
  await userEvent.click(btn);
  expect(onClick).toHaveBeenCalledOnce();
});

test('link variant renders an anchor', () => {
  render(<ButtonLink href="/collections" variant="on-dark">Shop the collection</ButtonLink>);
  const link = screen.getByRole('link', { name: 'Shop the collection' });
  expect(link).toHaveAttribute('href', '/collections');
  expect(link).toHaveAttribute('data-variant', 'on-dark');
});

test('is accessible', async () => {
  const { container } = render(<><Button>One</Button><ButtonLink href="/">Two</ButtonLink></>);
  await expectNoAxeViolations(container);
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `pnpm --filter @argiva/ui test Button`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement**

`Button.tsx`:
```tsx
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'on-dark' | 'outline';

const cls = (variant: ButtonVariant, extra?: string) => [styles.button, styles[variant], extra].filter(Boolean).join(' ');

export function Button({ variant = 'primary', type = 'button', className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button type={type} data-variant={variant} className={cls(variant, className)} {...rest} />;
}

export function ButtonLink({ variant = 'primary', className, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: ButtonVariant }) {
  return <a data-variant={variant} className={cls(variant, className)} {...rest} />;
}
```

`Button.module.css`:
```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--argiva-size-tap-min);
  padding: 0.9rem 1.6rem;
  border: 1px solid currentColor;
  border-radius: var(--argiva-component-button-primary-radius);
  font: inherit;
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
}
.primary {
  background: var(--argiva-component-button-primary-bg);
  color: var(--argiva-component-button-primary-fg);
  border-color: var(--argiva-component-button-primary-bg);
}
.primary:hover { background: var(--argiva-component-button-primary-bg-hover); border-color: var(--argiva-component-button-primary-bg-hover); }
.on-dark {
  background: var(--argiva-component-button-on-dark-bg);
  color: var(--argiva-component-button-on-dark-fg);
  border-color: var(--argiva-component-button-on-dark-bg);
  border-radius: var(--argiva-component-button-on-dark-radius);
}
.on-dark:hover { background: var(--argiva-component-button-on-dark-bg-hover); }
.on-dark:focus-visible { outline-color: var(--argiva-color-focus-inverse); }
.outline { background: transparent; color: inherit; }
.outline:hover {
  background: var(--argiva-component-button-primary-bg);
  color: var(--argiva-component-button-primary-fg);
  border-color: var(--argiva-component-button-primary-bg);
}
.button:disabled { opacity: 0.5; cursor: not-allowed; }
@media (prefers-reduced-motion: no-preference) {
  .button { transition: background-color var(--argiva-motion-duration-fast) var(--argiva-motion-easing-standard); }
}
```

- [ ] **Step 4: Run the tests**

Run: `pnpm --filter @argiva/ui test Button && pnpm lint:no-hex`
Expected: 3 tests pass; no hex found.

- [ ] **Step 5: Export and checkpoint**

`src/index.ts`: `export { Button, ButtonLink, type ButtonVariant } from './components/Button/Button';`
Update `sdd/state.json`. Do not commit.

---

### Task 6: PurityBadge (hallmark stamp)

**Files:**
- Create: `packages/ui/src/components/PurityBadge/PurityBadge.tsx`, `PurityBadge.module.css`, `PurityBadge.test.tsx`

**Interfaces:**
- Consumes: `useThemeManifest()`.
- Produces: `type PurityTone = 'sterling' | 'alloy'`; `PurityBadge({ label: string; tone: PurityTone })`. It renders `data-variant` (from `ornaments.purityBadge`) and `data-tone`. The label is supplied by the Phase 3 composition function. The badge never builds the text itself.

- [ ] **Step 1: Write the failing test**

`PurityBadge.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { expectNoAxeViolations } from '../../test/axe';
import { PurityBadge } from './PurityBadge';

test('hallmark variant in the default theme, solid for sterling', () => {
  render(<PurityBadge label="92.5% sterling silver" tone="sterling" />);
  const badge = screen.getByText('92.5% sterling silver');
  expect(badge).toHaveAttribute('data-variant', 'hallmark');
  expect(badge).toHaveAttribute('data-tone', 'sterling');
});

test('alloy tone is marked so it can be dashed', () => {
  render(<PurityBadge label="80% silver" tone="alloy" />);
  expect(screen.getByText('80% silver')).toHaveAttribute('data-tone', 'alloy');
});

test('text variant in warm-craft', () => {
  render(<ThemeProvider themeId="warm-craft"><PurityBadge label="60% silver" tone="alloy" /></ThemeProvider>);
  expect(screen.getByText('60% silver')).toHaveAttribute('data-variant', 'text');
});

test('is accessible', async () => {
  const { container } = render(<PurityBadge label="92.5% sterling silver" tone="sterling" />);
  await expectNoAxeViolations(container);
});
```

- [ ] **Step 2: Run it to see it fail.** `pnpm --filter @argiva/ui test PurityBadge` → FAIL, module not found.

- [ ] **Step 3: Implement**

`PurityBadge.tsx`:
```tsx
import { useThemeManifest } from '../../theme/ThemeProvider';
import styles from './PurityBadge.module.css';

export type PurityTone = 'sterling' | 'alloy';

export function PurityBadge({ label, tone }: { label: string; tone: PurityTone }) {
  const variant = useThemeManifest().ornaments.purityBadge;
  return (
    <span className={`${styles.badge} ${styles[variant]} ${styles[tone]}`} data-variant={variant} data-tone={tone}>
      {label}
    </span>
  );
}
```

`PurityBadge.module.css`:
```css
.badge {
  display: inline-block;
  color: var(--argiva-component-badge-purity-fg);
  font-size: var(--argiva-font-size-xs);
  font-weight: 500;
  line-height: 1.3;
  font-variant-numeric: tabular-nums;
}
.hallmark {
  padding: 0.3rem 0.55rem 0.25rem;
  font-family: var(--argiva-font-family-display);
  letter-spacing: 0.06em;
  border: 1px solid var(--argiva-component-badge-purity-border);
  border-radius: 0 0 0.8rem 0.8rem;
  background: color-mix(in srgb, var(--argiva-color-surface-page) 85%, transparent);
}
.text { text-transform: uppercase; letter-spacing: 0.08em; }
.hallmark.alloy { border-style: dashed; }
```

- [ ] **Step 4: Run the tests.** `pnpm --filter @argiva/ui test PurityBadge && pnpm lint:no-hex` → 4 pass.

- [ ] **Step 5: Export and checkpoint.** `export { PurityBadge, type PurityTone } from './components/PurityBadge/PurityBadge';` Update `sdd/state.json`. Do not commit.

---

### Task 7: Price

**Files:**
- Create: `packages/ui/src/components/Price/Price.tsx`, `Price.module.css`, `Price.test.tsx`

**Interfaces:**
- Consumes: `formatInr`.
- Produces: `Price({ paise: number; size?: 'md' | 'lg' })` renders `<data value={paise}>` with ledger numerals.

- [ ] **Step 1: Write the failing test**

`Price.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { Price } from './Price';

test('shows formatted rupees and keeps paise as machine value', () => {
  render(<Price paise={245000} />);
  const el = screen.getByText('₹2,450');
  expect(el.tagName).toBe('DATA');
  expect(el).toHaveAttribute('value', '245000');
  expect(el).toHaveAttribute('data-size', 'md');
});
```

- [ ] **Step 2: Run it to see it fail.** `pnpm --filter @argiva/ui test Price` → FAIL.

- [ ] **Step 3: Implement**

`Price.tsx`:
```tsx
import { formatInr } from '../../lib/format';
import styles from './Price.module.css';

export function Price({ paise, size = 'md' }: { paise: number; size?: 'md' | 'lg' }) {
  return (
    <data value={paise} data-size={size} className={`${styles.price} ${styles[size]}`}>
      {formatInr(paise)}
    </data>
  );
}
```

`Price.module.css`:
```css
.price { font-variant-numeric: tabular-nums; font-weight: var(--argiva-font-weight-strong); white-space: nowrap; }
.md { font-size: var(--argiva-font-size-md); }
.lg { font-size: var(--argiva-font-size-xl); }
```

- [ ] **Step 4: Run the tests.** Expected: pass.

- [ ] **Step 5: Export and checkpoint.** `export { Price } from './components/Price/Price';` Update `sdd/state.json`. Do not commit.

---

### Task 8: ProductCard

**Files:**
- Create: `packages/ui/src/components/ProductCard/ProductCard.tsx`, `ProductCard.module.css`, `ProductCard.test.tsx`

**Interfaces:**
- Consumes: `PurityBadge`, `PurityTone`, `Price`, `formatWeight`.
- Produces:
```ts
export type ImageData = { src: string; alt: string; width: number; height: number };
export type ProductCardProps = {
  href: string;
  name: string;
  image: ImageData;
  pricePaise: number;
  weightGrams: number;
  finish: string;
  purity: { label: string; tone: PurityTone };
};
```
`ImageData` is exported from `src/types.ts` so that `ProductHeader` and `Hero` reuse it.

- [ ] **Step 1: Create `src/types.ts`**

```ts
export type ImageData = { src: string; alt: string; width: number; height: number };
```

- [ ] **Step 2: Write the failing test**

`ProductCard.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/axe';
import { ProductCard, type ProductCardProps } from './ProductCard';

const props: ProductCardProps = {
  href: '/products/ghungroo-payal',
  name: 'Ghungroo Payal',
  image: { src: '/p.svg', alt: 'Pair of silver anklets with small bells', width: 800, height: 1000 },
  pricePaise: 245000,
  weightGrams: 24.5,
  finish: 'Oxidised',
  purity: { label: '92.5% sterling silver', tone: 'sterling' },
};

test('shows the four facts: purity, weight, finish, price', () => {
  render(<ProductCard {...props} />);
  expect(screen.getByText('92.5% sterling silver')).toBeInTheDocument();
  expect(screen.getByText('24.5 g · Oxidised')).toBeInTheDocument();
  expect(screen.getByText('₹2,450')).toBeInTheDocument();
});

test('one link, named by the product', () => {
  render(<ProductCard {...props} />);
  const links = screen.getAllByRole('link');
  expect(links).toHaveLength(1);
  expect(links[0]).toHaveAccessibleName('Ghungroo Payal');
  expect(links[0]).toHaveAttribute('href', '/products/ghungroo-payal');
});

test('image keeps its intrinsic size and lazy-loads', () => {
  render(<ProductCard {...props} />);
  const img = screen.getByRole('img', { name: props.image.alt });
  expect(img).toHaveAttribute('width', '800');
  expect(img).toHaveAttribute('loading', 'lazy');
});

test('is accessible', async () => {
  const { container } = render(<ProductCard {...props} />);
  await expectNoAxeViolations(container);
});
```

- [ ] **Step 3: Run it to see it fail.** `pnpm --filter @argiva/ui test ProductCard` → FAIL.

- [ ] **Step 4: Implement**

`ProductCard.tsx`:
```tsx
import { formatWeight } from '../../lib/format';
import type { ImageData } from '../../types';
import { Price } from '../Price/Price';
import { PurityBadge, type PurityTone } from '../PurityBadge/PurityBadge';
import styles from './ProductCard.module.css';

export type ProductCardProps = {
  href: string;
  name: string;
  image: ImageData;
  pricePaise: number;
  weightGrams: number;
  finish: string;
  purity: { label: string; tone: PurityTone };
};

export function ProductCard({ href, name, image, pricePaise, weightGrams, finish, purity }: ProductCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <img src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async" />
        <div className={styles.badge}><PurityBadge {...purity} /></div>
      </div>
      <h3 className={styles.name}>
        <a href={href} className={styles.link}>{name}</a>
      </h3>
      <p className={styles.meta}>
        <span>{`${formatWeight(weightGrams)} · ${finish}`}</span>
        <Price paise={pricePaise} />
      </p>
    </article>
  );
}
```

`ProductCard.module.css`:
```css
.card { position: relative; display: grid; gap: var(--argiva-space-3); }
.media {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: var(--argiva-component-card-media-bg);
  border-radius: var(--argiva-component-card-media-radius);
}
.media img { width: 100%; height: 100%; object-fit: cover; }
.badge { position: absolute; top: var(--argiva-space-3); left: var(--argiva-space-3); }
.name {
  font-family: var(--argiva-font-family-body);
  font-size: 1.02rem;
  font-weight: 500;
  letter-spacing: normal;
  color: var(--argiva-component-card-title);
}
.link { color: inherit; text-decoration: none; }
/* Stretched link: the whole card is clickable, but there is one link with one name. */
.link::after { content: ''; position: absolute; inset: 0; }
.link:focus-visible { outline: none; }
.link:focus-visible::after { outline: 2px solid var(--argiva-color-focus-default); outline-offset: 4px; }
.meta {
  display: flex;
  justify-content: space-between;
  gap: var(--argiva-space-3);
  margin: 0;
  color: var(--argiva-component-card-meta);
  font-size: var(--argiva-font-size-sm);
}
@media (prefers-reduced-motion: no-preference) {
  .media img { transition: transform 600ms var(--argiva-motion-easing-out); }
  .card:hover .media img { transform: scale(1.06); }
}
```

- [ ] **Step 5: Run the tests.** `pnpm --filter @argiva/ui test ProductCard && pnpm lint:no-hex` → 4 pass.

- [ ] **Step 6: Export and checkpoint.** Add `export { ProductCard, type ProductCardProps } from './components/ProductCard/ProductCard';` and `export type { ImageData } from './types';`. Update `sdd/state.json`. Do not commit.

---

### Task 9: Divider (hairline or ghungroo)

**Files:**
- Create: `packages/ui/src/components/Divider/Divider.tsx`, `Ghungroo.tsx`, `Divider.module.css`, `Divider.test.tsx`

**Interfaces:**
- Consumes: `useThemeManifest()`, `isInOrnamentScope`, `OrnamentContext`.
- Produces: `Divider({ context?: OrnamentContext; onDark?: boolean })`. It renders `<hr data-kind="rule">` or a decorative ghungroo `<div role="separator" data-kind="ghungroo">`.

- [ ] **Step 1: Write the failing test**

`Divider.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { expectNoAxeViolations } from '../../test/axe';
import { Divider } from './Divider';

test('default theme: ghungroo on Our Story', () => {
  render(<Divider context={{ page: 'our-story' }} />);
  expect(screen.getByRole('separator')).toHaveAttribute('data-kind', 'ghungroo');
});

test('default theme: ghungroo on the Anklets collection', () => {
  render(<Divider context={{ collection: 'anklets' }} />);
  expect(screen.getByRole('separator')).toHaveAttribute('data-kind', 'ghungroo');
});

test('default theme: plain rule elsewhere', () => {
  render(<Divider context={{ collection: 'rings' }} />);
  expect(screen.getByRole('separator')).toHaveAttribute('data-kind', 'rule');
});

test('modern-bold never shows the ghungroo', () => {
  render(<ThemeProvider themeId="modern-bold"><Divider context={{ page: 'our-story' }} /></ThemeProvider>);
  expect(screen.getByRole('separator')).toHaveAttribute('data-kind', 'rule');
});

test('is accessible', async () => {
  const { container } = render(<Divider context={{ page: 'our-story' }} />);
  await expectNoAxeViolations(container);
});
```

- [ ] **Step 2: Run it to see it fail.** `pnpm --filter @argiva/ui test Divider` → FAIL.

- [ ] **Step 3: Implement**

`Ghungroo.tsx` (a chain of small bells; `currentColor` so the token sets the colour):
```tsx
export function Ghungroo() {
  const bells = Array.from({ length: 9 }, (_, i) => 20 + i * 40);
  return (
    <svg viewBox="0 0 360 28" width="360" height="28" aria-hidden="true" focusable="false">
      <path d="M0 8 H360" stroke="currentColor" strokeWidth="1" fill="none" pathLength={1} />
      {bells.map((x) => (
        <g key={x}>
          <path d={`M${x} 8 v4`} stroke="currentColor" strokeWidth="1" />
          <circle cx={x} cy={18} r={5.5} fill="none" stroke="currentColor" strokeWidth="1" />
          <path d={`M${x - 3} 20.5 h6`} stroke="currentColor" strokeWidth="1" />
        </g>
      ))}
    </svg>
  );
}
```

`Divider.tsx`:
```tsx
import { isInOrnamentScope, type OrnamentContext } from '../../lib/ornament-scope';
import { useThemeManifest } from '../../theme/ThemeProvider';
import styles from './Divider.module.css';
import { Ghungroo } from './Ghungroo';

export function Divider({ context = {}, onDark = false }: { context?: OrnamentContext; onDark?: boolean }) {
  const { divider, dividerScope } = useThemeManifest().ornaments;
  const tone = onDark ? styles.onDark : '';
  if (divider === 'ghungroo' && isInOrnamentScope(dividerScope, context)) {
    return (
      <div role="separator" data-kind="ghungroo" className={`${styles.ghungroo} ${tone}`}>
        <Ghungroo />
      </div>
    );
  }
  return <hr data-kind="rule" className={`${styles.rule} ${tone}`} />;
}
```

`Divider.module.css`:
```css
.rule { border: 0; border-top: 1px solid var(--argiva-color-border-default); margin: var(--argiva-space-7) 0; }
.ghungroo {
  display: flex;
  justify-content: center;
  margin: var(--argiva-space-7) 0;
  color: var(--argiva-component-divider-ornament);
}
.onDark { color: var(--argiva-component-divider-ornament-on-dark); border-top-color: var(--argiva-color-border-strong); }
@media (prefers-reduced-motion: no-preference) {
  .ghungroo svg > path:first-child {
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    animation: draw var(--argiva-motion-duration-slow) var(--argiva-motion-easing-out) forwards;
  }
}
@keyframes draw { to { stroke-dashoffset: 0; } }
```

- [ ] **Step 4: Run the tests.** `pnpm --filter @argiva/ui test Divider && pnpm lint:no-hex` → 5 pass.

- [ ] **Step 5: Export and checkpoint.** `export { Divider } from './components/Divider/Divider';` Update `sdd/state.json`. Do not commit.

---

### Task 10: SiteHeader

**Files:**
- Create: `packages/ui/src/components/SiteHeader/SiteHeader.tsx`, `SiteHeader.module.css`, `SiteHeader.test.tsx`

**Interfaces:**
- Produces: `type NavItem = { href: string; label: string }`; `SiteHeader({ homeHref: string; nav: NavItem[]; cartHref: string; cartCount: number })`. It starts with `'use client'` (it has toggle state).

- [ ] **Step 1: Write the failing test**

`SiteHeader.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/axe';
import { SiteHeader } from './SiteHeader';

const nav = [{ href: '/collections', label: 'Collections' }, { href: '/our-story', label: 'Our Story' }];

test('wordmark links home', () => {
  render(<SiteHeader homeHref="/" nav={nav} cartHref="/cart" cartCount={2} />);
  expect(screen.getByRole('link', { name: 'ARGIVA' })).toHaveAttribute('href', '/');
});

test('cart link visible text equals its accessible name', () => {
  render(<SiteHeader homeHref="/" nav={nav} cartHref="/cart" cartCount={2} />);
  const cart = screen.getByRole('link', { name: 'Cart (2)' });
  expect(cart).toHaveTextContent('Cart (2)');
  expect(cart).not.toHaveAttribute('aria-label');
});

test('menu button toggles the nav', async () => {
  render(<SiteHeader homeHref="/" nav={nav} cartHref="/cart" cartCount={0} />);
  const btn = screen.getByRole('button', { name: 'Menu' });
  expect(btn).toHaveAttribute('aria-expanded', 'false');
  await userEvent.click(btn);
  expect(btn).toHaveAttribute('aria-expanded', 'true');
  expect(document.getElementById(btn.getAttribute('aria-controls')!)).toHaveAttribute('data-open', 'true');
});

test('is accessible', async () => {
  const { container } = render(<SiteHeader homeHref="/" nav={nav} cartHref="/cart" cartCount={0} />);
  await expectNoAxeViolations(container);
});
```

- [ ] **Step 2: Run it to see it fail.** `pnpm --filter @argiva/ui test SiteHeader` → FAIL.

- [ ] **Step 3: Implement**

`SiteHeader.tsx`:
```tsx
'use client';
import { useId, useState } from 'react';
import styles from './SiteHeader.module.css';

export type NavItem = { href: string; label: string };

export function SiteHeader({ homeHref, nav, cartHref, cartCount }: { homeHref: string; nav: NavItem[]; cartHref: string; cartCount: number }) {
  const [open, setOpen] = useState(false);
  const navId = useId();
  return (
    <header className={styles.header}>
      <a href={homeHref} className={styles.wordmark}>ARGIVA</a>
      <button type="button" className={styles.menu} aria-expanded={open} aria-controls={navId} onClick={() => setOpen((o) => !o)}>
        Menu
      </button>
      <nav id={navId} aria-label="Main" data-open={open} className={styles.nav}>
        <ul>
          {nav.map((item) => (
            <li key={item.href}><a href={item.href}>{item.label}</a></li>
          ))}
        </ul>
      </nav>
      <a href={cartHref} className={styles.cart}>{`Cart (${cartCount})`}</a>
    </header>
  );
}
```

`SiteHeader.module.css`:
```css
.header {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: var(--argiva-space-4);
  max-width: var(--argiva-size-content-max);
  margin: 0 auto;
  padding: var(--argiva-space-4) var(--argiva-space-gutter);
  border-bottom: 1px solid var(--argiva-color-border-default);
}
.wordmark {
  font-family: var(--argiva-font-family-display);
  font-size: var(--argiva-font-size-md);
  letter-spacing: var(--argiva-font-tracking-wordmark);
  text-transform: uppercase;
  color: inherit;
  text-decoration: none;
}
.menu, .cart, .nav a {
  min-height: var(--argiva-size-tap-min);
  display: inline-flex;
  align-items: center;
  padding: 0 var(--argiva-space-3);
  color: inherit;
  font: inherit;
  background: none;
  border: 0;
  text-decoration: none;
  cursor: pointer;
}
.cart { font-variant-numeric: tabular-nums; }
.nav ul { list-style: none; margin: 0; padding: 0; }
.nav { grid-column: 1 / -1; display: none; }
.nav[data-open='true'] { display: block; }
@media (min-width: 48rem) {
  .header { grid-template-columns: auto 1fr auto; }
  .menu { display: none; }
  .nav { grid-column: auto; display: block; justify-self: end; }
  .nav ul { display: flex; gap: var(--argiva-space-2); }
}
```

- [ ] **Step 4: Run the tests.** `pnpm --filter @argiva/ui test SiteHeader && pnpm lint:no-hex` → 4 pass.

- [ ] **Step 5: Export and checkpoint.** `export { SiteHeader, type NavItem } from './components/SiteHeader/SiteHeader';` Update `sdd/state.json`. Do not commit.

---

### Task 11: Hero

**Files:**
- Create: `packages/ui/src/components/Hero/Hero.tsx`, `Hero.module.css`, `Hero.test.tsx`

**Interfaces:**
- Consumes: `ButtonLink`, `ImageData`, `useThemeManifest()`.
- Produces: `Hero({ eyebrow?: string; title: string; body: string; action: { href: string; label: string }; image: ImageData })`. It renders the page's only `<h1>`, the photo first on mobile, and `data-media` from `ornaments.heroMedia`.

- [ ] **Step 1: Write the failing test**

`Hero.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { expectNoAxeViolations } from '../../test/axe';
import { Hero } from './Hero';

const props = {
  eyebrow: 'Placeholder eyebrow',
  title: 'Modern Silver. Timeless Stories.',
  body: 'Placeholder hero text.',
  action: { href: '/collections', label: 'Shop the collection' },
  image: { src: '/h.svg', alt: 'Silver anklet resting on indigo cloth', width: 1200, height: 1500 },
};

test('one h1, one action, eager image', () => {
  render(<Hero {...props} />);
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  expect(screen.getByRole('link', { name: 'Shop the collection' })).toHaveAttribute('data-variant', 'on-dark');
  expect(screen.getByRole('img')).toHaveAttribute('fetchpriority', 'high');
});

test('frame shape comes from the theme', () => {
  const { rerender, container } = render(<Hero {...props} />);
  expect(container.querySelector('[data-media]')).toHaveAttribute('data-media', 'rect');
  rerender(<ThemeProvider themeId="warm-craft"><Hero {...props} /></ThemeProvider>);
  expect(container.querySelector('[data-media]')).toHaveAttribute('data-media', 'arch');
});

test('is accessible', async () => {
  const { container } = render(<Hero {...props} />);
  await expectNoAxeViolations(container);
});
```

Fixture text is placeholder only; real hero copy comes from [docs/brand-content.md](../brand-content.md).

- [ ] **Step 2: Run it to see it fail.** `pnpm --filter @argiva/ui test Hero` → FAIL.

- [ ] **Step 3: Implement**

`Hero.tsx`:
```tsx
import type { ImageData } from '../../types';
import { useThemeManifest } from '../../theme/ThemeProvider';
import { ButtonLink } from '../Button/Button';
import styles from './Hero.module.css';

type HeroProps = { eyebrow?: string; title: string; body: string; action: { href: string; label: string }; image: ImageData };

export function Hero({ eyebrow, title, body, action, image }: HeroProps) {
  const media = useThemeManifest().ornaments.heroMedia;
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.media} data-media={media}>
          <img src={image.src} alt={image.alt} width={image.width} height={image.height} fetchPriority="high" />
        </div>
        <div className={styles.copy}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.body}>{body}</p>
          <ButtonLink href={action.href} variant="on-dark">{action.label}</ButtonLink>
        </div>
      </div>
    </section>
  );
}
```

`Hero.module.css`:
```css
.hero { background: var(--argiva-component-hero-bg); color: var(--argiva-component-hero-fg); }
.inner {
  display: grid;
  gap: var(--argiva-space-6);
  max-width: var(--argiva-size-content-max);
  margin: 0 auto;
  padding: var(--argiva-space-section) var(--argiva-space-gutter);
}
.media { position: relative; overflow: hidden; aspect-ratio: 4 / 5; border-radius: var(--argiva-component-hero-media-radius); }
.media img { width: 100%; height: 100%; object-fit: cover; }
/* Display-case frame: an inset hairline inside the photo. */
.media::after { content: ''; position: absolute; inset: var(--argiva-space-3); border: 1px solid var(--argiva-component-hero-muted); pointer-events: none; }
.media[data-media='arch'] { border-radius: 50% 50% 0 0 / 30% 30% 0 0; }
.media[data-media='arch']::after { border-radius: inherit; }
.copy { display: grid; gap: var(--argiva-space-4); align-content: center; justify-items: start; }
.eyebrow { margin: 0; color: var(--argiva-component-hero-muted); font-size: var(--argiva-font-size-sm); letter-spacing: 0.08em; text-transform: uppercase; }
.title { font-size: var(--argiva-font-size-display); line-height: var(--argiva-font-line-height-tight); }
.body { margin: 0; max-width: var(--argiva-size-prose-max); }
.copy :focus-visible { outline-color: var(--argiva-color-focus-inverse); }
@media (min-width: 54rem) {
  .inner { grid-template-columns: 1fr 1fr; align-items: center; }
  .media { order: 2; }
}
@media (prefers-reduced-motion: no-preference) {
  .copy > * { animation: rise var(--argiva-motion-duration-slow) var(--argiva-motion-easing-out) both; }
  .copy > :nth-child(2) { animation-delay: 80ms; }
  .copy > :nth-child(3) { animation-delay: 160ms; }
  .copy > :nth-child(4) { animation-delay: 240ms; }
}
@keyframes rise { from { opacity: 0; transform: translateY(0.75rem); } }
```

- [ ] **Step 4: Run the tests.** If React warns about the `fetchPriority` attribute in this React version, keep the prop (React 19 supports it) and make sure the test reads the lower-case `fetchpriority` attribute. Run `pnpm --filter @argiva/ui test Hero && pnpm lint:no-hex` → 3 pass.

- [ ] **Step 5: Export and checkpoint.** `export { Hero } from './components/Hero/Hero';` Update `sdd/state.json`. Do not commit.

---

### Task 12: ProductHeader (top of the product page)

**Files:**
- Create: `packages/ui/src/components/ProductHeader/ProductHeader.tsx`, `ProductHeader.module.css`, `ProductHeader.test.tsx`

**Interfaces:**
- Consumes: `Button`, `Price`, `PurityBadge`, `PurityTone`, `formatWeight`, `ImageData`.
- Produces:
```ts
export type ProductHeaderProps = {
  name: string;
  images: [ImageData, ...ImageData[]];
  pricePaise: number;
  weightGrams: number;
  finish: string;
  purity: { label: string; tone: PurityTone };
  addToCartLabel: string;
  onAddToCart: () => void;
};
```
It starts with `'use client'`. On phones the add-to-cart bar sticks to the bottom of the screen.

- [ ] **Step 1: Write the failing test**

`ProductHeader.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/axe';
import { ProductHeader, type ProductHeaderProps } from './ProductHeader';

const props: ProductHeaderProps = {
  name: 'Ghungroo Payal',
  images: [
    { src: '/a.svg', alt: 'Anklet pair, front', width: 800, height: 1000 },
    { src: '/b.svg', alt: 'Anklet clasp, close-up', width: 800, height: 1000 },
  ],
  pricePaise: 245000,
  weightGrams: 24.5,
  finish: 'Oxidised',
  purity: { label: '92.5% sterling silver', tone: 'sterling' },
  addToCartLabel: 'Add to cart',
  onAddToCart: vi.fn(),
};

test('name is the h1 and facts are visible', () => {
  render(<ProductHeader {...props} />);
  expect(screen.getByRole('heading', { level: 1, name: 'Ghungroo Payal' })).toBeInTheDocument();
  expect(screen.getByText('92.5% sterling silver')).toBeInTheDocument();
  expect(screen.getByText('₹2,450')).toBeInTheDocument();
  expect(screen.getByText('24.5 g')).toBeInTheDocument();
  expect(screen.getByText('Oxidised')).toBeInTheDocument();
});

test('thumbnails switch the main image', async () => {
  render(<ProductHeader {...props} />);
  const second = screen.getByRole('button', { name: 'Show image 2: Anklet clasp, close-up' });
  expect(second).toHaveAttribute('aria-pressed', 'false');
  await userEvent.click(second);
  expect(second).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('img', { name: 'Anklet clasp, close-up' })).toBeInTheDocument();
});

test('add to cart calls back', async () => {
  const onAddToCart = vi.fn();
  render(<ProductHeader {...props} onAddToCart={onAddToCart} />);
  await userEvent.click(screen.getByRole('button', { name: 'Add to cart' }));
  expect(onAddToCart).toHaveBeenCalledOnce();
});

test('is accessible', async () => {
  const { container } = render(<ProductHeader {...props} />);
  await expectNoAxeViolations(container);
});
```

- [ ] **Step 2: Run it to see it fail.** `pnpm --filter @argiva/ui test ProductHeader` → FAIL.

- [ ] **Step 3: Implement**

`ProductHeader.tsx`:
```tsx
'use client';
import { useState } from 'react';
import { formatWeight } from '../../lib/format';
import type { ImageData } from '../../types';
import { Button } from '../Button/Button';
import { Price } from '../Price/Price';
import { PurityBadge, type PurityTone } from '../PurityBadge/PurityBadge';
import styles from './ProductHeader.module.css';

export type ProductHeaderProps = {
  name: string;
  images: [ImageData, ...ImageData[]];
  pricePaise: number;
  weightGrams: number;
  finish: string;
  purity: { label: string; tone: PurityTone };
  addToCartLabel: string;
  onAddToCart: () => void;
};

export function ProductHeader({ name, images, pricePaise, weightGrams, finish, purity, addToCartLabel, onAddToCart }: ProductHeaderProps) {
  const [active, setActive] = useState(0);
  const main = images[active] ?? images[0];
  return (
    <section className={styles.layout}>
      <div className={styles.gallery}>
        <div className={styles.main}>
          <img src={main.src} alt={main.alt} width={main.width} height={main.height} fetchPriority="high" />
        </div>
        {images.length > 1 ? (
          <ul className={styles.thumbs}>
            {images.map((img, i) => (
              <li key={img.src}>
                <button type="button" aria-pressed={i === active} aria-label={`Show image ${i + 1}: ${img.alt}`} onClick={() => setActive(i)}>
                  <img src={img.src} alt="" width={img.width} height={img.height} loading="lazy" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className={styles.details}>
        <PurityBadge {...purity} />
        <h1 className={styles.name}>{name}</h1>
        <Price paise={pricePaise} size="lg" />
        <dl className={styles.facts}>
          <div><dt>Weight</dt><dd className="argiva-ledger">{formatWeight(weightGrams)}</dd></div>
          <div><dt>Finish</dt><dd>{finish}</dd></div>
        </dl>
        <div className={styles.cta}>
          <Button onClick={onAddToCart}>{addToCartLabel}</Button>
        </div>
      </div>
    </section>
  );
}
```

`ProductHeader.module.css`:
```css
.layout {
  display: grid;
  gap: var(--argiva-space-6);
  max-width: var(--argiva-size-content-max);
  margin: 0 auto;
  padding: var(--argiva-space-6) var(--argiva-space-gutter);
}
.gallery { display: grid; gap: var(--argiva-space-3); }
.main { aspect-ratio: 4 / 5; background: var(--argiva-component-card-media-bg); border-radius: var(--argiva-radius-media); overflow: hidden; }
.main img { width: 100%; height: 100%; object-fit: cover; }
.thumbs { display: flex; gap: var(--argiva-space-2); list-style: none; margin: 0; padding: 0; overflow-x: auto; }
.thumbs button {
  width: 4.5rem;
  min-height: var(--argiva-size-tap-min);
  padding: 0;
  border: 1px solid var(--argiva-color-border-default);
  background: var(--argiva-component-card-media-bg);
  cursor: pointer;
}
.thumbs button[aria-pressed='true'] { border-color: var(--argiva-color-action-bg); }
.details { display: grid; gap: var(--argiva-space-4); align-content: start; justify-items: start; }
.name { font-size: var(--argiva-font-size-2xl); }
.facts { display: grid; grid-template-columns: auto auto; gap: var(--argiva-space-2) var(--argiva-space-6); margin: 0; }
.facts dt { color: var(--argiva-color-text-muted); font-size: var(--argiva-font-size-sm); }
.facts dd { margin: 0; }
.cta {
  position: sticky;
  bottom: 0;
  justify-self: stretch;
  display: grid;
  padding: var(--argiva-space-3) 0;
  background: var(--argiva-color-surface-page);
  border-top: 1px solid var(--argiva-color-border-default);
}
@media (min-width: 54rem) {
  .layout { grid-template-columns: 1.2fr 1fr; }
  .gallery { grid-template-columns: 4.5rem 1fr; }
  .main { order: 2; }
  .thumbs { flex-direction: column; }
  .cta { position: static; border-top: 0; justify-self: start; }
}
```

- [ ] **Step 4: Run the tests.** `pnpm --filter @argiva/ui test ProductHeader && pnpm ui:typecheck && pnpm lint:no-hex` → 4 pass, no type errors.

- [ ] **Step 5: Export and checkpoint.** `export { ProductHeader, type ProductHeaderProps } from './components/ProductHeader/ProductHeader';` Update `sdd/state.json`. Do not commit.

---

### Task 13: Preview app

**Files:**
- Create: `apps/ui-preview/package.json`, `apps/ui-preview/vite.config.ts`, `apps/ui-preview/tsconfig.json`, `apps/ui-preview/index.html`, `apps/ui-preview/src/main.tsx`, `apps/ui-preview/src/App.tsx`, `apps/ui-preview/src/App.module.css`, `apps/ui-preview/src/fixtures.ts`, `apps/ui-preview/public/placeholders/anklet.svg`, `apps/ui-preview/public/placeholders/pendant.svg`
- Modify: root `package.json` scripts

**Interfaces:**
- Consumes: everything exported from `@argiva/ui`, plus `themeIds`, `isThemeId` and `ThemeId` from `@argiva/design-tokens`.
- Produces: `pnpm ui:preview` serves at `http://localhost:5174/#<theme-id>`.

- [ ] **Step 1: Create the files**

`apps/ui-preview/package.json`:
```json
{
  "name": "@argiva/ui-preview",
  "private": true,
  "type": "module",
  "scripts": { "dev": "vite --port 5174", "build": "vite build", "preview": "vite preview --port 5174" }
}
```

`apps/ui-preview/vite.config.ts`:
```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({ plugins: [react()] });
```

`apps/ui-preview/tsconfig.json`:
```json
{ "extends": "../../tsconfig.base.json", "compilerOptions": { "types": ["vite/client"] }, "include": ["src", "vite.config.ts"] }
```

`apps/ui-preview/index.html`:
```html
<!doctype html>
<html lang="en-IN" data-theme="quiet-luxury">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ARGIVA UI preview</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`apps/ui-preview/src/main.tsx`:
```tsx
import '@argiva/ui/global.css';
import '@argiva/ui/fonts';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
```

`apps/ui-preview/src/fixtures.ts` (placeholder data; real copy and products come later):
```ts
import type { ProductCardProps } from '@argiva/ui';

const img = (name: string, alt: string) => ({ src: `/placeholders/${name}.svg`, alt, width: 800, height: 1000 });

export const products: ProductCardProps[] = [
  { href: '#', name: 'Ghungroo Payal', image: img('anklet', 'Placeholder: pair of anklets'), pricePaise: 245000, weightGrams: 24.5, finish: 'Oxidised', purity: { label: '92.5% sterling silver', tone: 'sterling' } },
  { href: '#', name: 'Leaf Pendant Chain', image: img('pendant', 'Placeholder: pendant on a chain'), pricePaise: 189900, weightGrams: 9.2, finish: 'Plain', purity: { label: '80% silver', tone: 'alloy' } },
  { href: '#', name: 'Everyday Toe Rings', image: img('anklet', 'Placeholder: pair of toe rings'), pricePaise: 64900, weightGrams: 4.1, finish: 'Plain', purity: { label: '60% silver', tone: 'alloy' } },
  { href: '#', name: 'Rose Finish Bangle', image: img('pendant', 'Placeholder: bangle'), pricePaise: 312050, weightGrams: 31.75, finish: 'Rose-gold finish on silver', purity: { label: '92.5% sterling silver', tone: 'sterling' } },
];
```

`apps/ui-preview/src/App.tsx`:
```tsx
import { isThemeId, themeIds, type ThemeId } from '@argiva/design-tokens';
import { Divider, Hero, ProductCard, ProductHeader, SiteHeader, ThemeProvider } from '@argiva/ui';
import { useEffect, useState } from 'react';
import styles from './App.module.css';
import { products } from './fixtures';

const fromHash = (): ThemeId => {
  const h = location.hash.slice(1);
  return isThemeId(h) ? h : 'quiet-luxury';
};

export function App() {
  const [theme, setTheme] = useState<ThemeId>(fromHash);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    history.replaceState(null, '', `#${theme}`);
  }, [theme]);
  const first = products[0]!;

  return (
    <ThemeProvider themeId={theme}>
      <div className={styles.toolbar}>
        <label>
          Theme{' '}
          <select value={theme} onChange={(e) => setTheme(e.target.value as ThemeId)}>
            {themeIds.map((id) => <option key={id} value={id}>{id}</option>)}
          </select>
        </label>
      </div>
      <SiteHeader homeHref="#" nav={[{ href: '#', label: 'Collections' }, { href: '#', label: 'Our Story' }]} cartHref="#" cartCount={0} />
      <main>
        <Hero
          eyebrow="Placeholder eyebrow"
          title="Modern Silver. Timeless Stories."
          body="Placeholder hero text. Final copy comes from docs/brand-content.md."
          action={{ href: '#', label: 'Shop the collection' }}
          image={{ src: '/placeholders/anklet.svg', alt: 'Placeholder: anklet', width: 800, height: 1000 }}
        />
        <section className={styles.section} aria-labelledby="grid-title">
          <h2 id="grid-title" className={styles.sectionTitle}>Anklets</h2>
          <Divider context={{ collection: 'anklets' }} />
          <div className={styles.grid}>
            {products.map((p) => <ProductCard key={p.name} {...p} />)}
          </div>
        </section>
        <ProductHeader
          name={first.name}
          images={[first.image, products[1]!.image]}
          pricePaise={first.pricePaise}
          weightGrams={first.weightGrams}
          finish={first.finish}
          purity={first.purity}
          addToCartLabel="Add to cart"
          onAddToCart={() => undefined}
        />
      </main>
    </ThemeProvider>
  );
}
```

The preview page has two `<h1>` elements (Hero and ProductHeader) because it shows two page tops side by side. Real pages have exactly one. Record this as a known preview-only axe finding; do not "fix" it in the components.

`apps/ui-preview/src/App.module.css`:
```css
.toolbar { padding: var(--argiva-space-2) var(--argiva-space-gutter); border-bottom: 1px solid var(--argiva-color-border-default); font-size: var(--argiva-font-size-sm); }
.toolbar select { min-height: var(--argiva-size-tap-min); font: inherit; }
.section { max-width: var(--argiva-size-content-max); margin: 0 auto; padding: var(--argiva-space-section) var(--argiva-space-gutter); }
.sectionTitle { font-size: var(--argiva-font-size-2xl); }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 15rem), 1fr)); gap: 2.5rem 1.5rem; }
```

`apps/ui-preview/public/placeholders/anklet.svg` and `pendant.svg`: plain, neutral grey 800×1000 SVGs with a simple line drawing (a chain of circles for the anklet, a drop shape on a line for the pendant) and the word "Placeholder" in small text. These live under `public/`, which the no-hex check does not scan, because they stand in for photos.

- [ ] **Step 2: Install and add scripts**

```bash
pnpm --filter @argiva/ui-preview add react react-dom @argiva/ui@workspace:* @argiva/design-tokens@workspace:*
pnpm --filter @argiva/ui-preview add -D vite @vitejs/plugin-react typescript @types/react @types/react-dom
```
Root `package.json` scripts:
```json
"ui:preview": "pnpm --filter @argiva/ui-preview dev",
"ui:preview:build": "pnpm --filter @argiva/ui-preview build"
```

- [ ] **Step 3: Build and run**

Run: `pnpm ui:preview:build && pnpm lint:no-hex`
Expected: the build succeeds; no hex found. Then start `pnpm ui:preview` in the background and open `http://localhost:5174/#quiet-luxury` in the browser tools. Expected: the header, hero, Anklets grid with the ghungroo divider, and the product header all render.

- [ ] **Step 4: Checkpoint.** Update `sdd/state.json`. Do not commit.

---

### Task 14: Visual verification, imagery rules and design review

**Files:**
- Create: `docs/design/imagery.md`, `sdd/design/phase-1/` (screenshots and the findings log)
- Modify: `DESIGN.md` (only if what was built differs from it), `sdd/state.json`, `sdd/phase-1-design-system.md`

- [ ] **Step 1: Screenshots.** With the preview running, use the browser tools to take screenshots at widths 375, 768 and 1280 for each theme (`#quiet-luxury`, `#warm-craft`, `#modern-bold`). That is 9 screenshots, saved to `sdd/design/phase-1/<theme>-<width>.png`.

- [ ] **Step 2: Reduced motion and keyboard.** Emulate `prefers-reduced-motion: reduce`: there should be no hero rise, no ghungroo draw and no image zoom. Tab through the whole page: every control should show a focus ring, and the order should be header → hero action → cards → thumbnails → add to cart.

- [ ] **Step 3: axe in the browser.** Run axe-core on the page for each theme, with colour contrast **enabled** this time. Expected: no violations except the known preview-only duplicate `<h1>`. Fix anything else in the component CSS or tokens.

- [ ] **Step 4: Impeccable.** From `packages/ui`, run `../../.github/skills/impeccable/scripts/impeccable detect src` and `/impeccable critique` on the preview screenshots. Fix every finding, or write down why it does not apply in `sdd/design/phase-1/findings.md`.

- [ ] **Step 5: Lighthouse.** Run `pnpm --filter @argiva/ui-preview preview`, then `npx lighthouse http://localhost:5174/#quiet-luxury --preset=desktop --only-categories=performance,accessibility,best-practices --output=json --output-path=sdd/design/phase-1/lighthouse-desktop.json`, and repeat without `--preset` for mobile. Record the scores in `findings.md`. Target: accessibility 100; performance ≥ 90 on mobile.

- [ ] **Step 6: Imagery rules.** Write `docs/design/imagery.md` covering:
  - aspect ratios: 4:5 for products and hero, square for thumbnails;
  - minimum source size: 1600 px on the long edge;
  - plain mist or indigo-cloth backgrounds;
  - true-to-metal colour, with no warm filters on silver;
  - one hand-held "scale" shot per product;
  - alt-text pattern: "[item], [view]";
  - placeholders only until ARGIVA's own photos exist;
  - never third-party photos.

- [ ] **Step 7: Sync DESIGN.md.** If any built value differs from [DESIGN.md](../../DESIGN.md), update DESIGN.md to match the tokens and components (the tokens win), and note the change in `sdd/phase-1-design-system.md`.

- [ ] **Step 8: Final checks.**
  - Run `pnpm tokens:build && pnpm ui:test && pnpm ui:typecheck && pnpm lint:no-hex && node --test scripts/check-no-hex.test.mjs && pnpm ui:preview:build`. Everything should pass.
  - Paste the summary output into `sdd/phase-1-design-system.md`.

- [ ] **Step 9: Stop for design review.**
  - Set `currentStep` to `1.review-design (awaiting owner)`, add the review request to `awaitingOwner`, and validate the JSON.
  - Show the owner the 9 screenshots, the findings and the Lighthouse scores.
  - Do not start Phase 2 until the owner approves. Do not commit.

---

## Self-review notes

- **Scope covered:** the Phase 1 scope (tokens are already done; this phase adds typography, colour use, motion, imagery rules, core components, and the home hero, product card and product page header) maps to Tasks 4–14.
- **Names checked:** `ImageData` (Task 8 `src/types.ts`) is used by Hero and ProductHeader. `PurityTone` (Task 6) and `OrnamentContext` (Task 3) are used consistently.
- **Deferred on purpose:**
  - Composition label rules (Phase 3).
  - Active-theme-only font loading and the `<html data-theme>` site setting (Phase 2 and Phase 6).
  - A lint rule against hex inside the Next.js app (extended in Phase 2 by adding `apps/web/src` to `lint:no-hex`).
