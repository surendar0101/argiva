# @argiva/ui-preview

A single preview page for the ARGIVA design system. It shows the shared components from [`@argiva/ui`](../../packages/ui/README.md) laid out like a real shop page, and lets you switch between themes. Use it to review a component or theme change before it reaches the website. It is a development tool only; it is not deployed.

## What it shows

One page, built with Vite and React, with:

- a **Theme** drop-down at the top listing every theme in `@argiva/design-tokens`;
- `SiteHeader` with two sample links and an empty cart;
- `Hero` with placeholder text and image;
- an "Anklets" section with a `Divider` and a grid of four `ProductCard`s;
- `ProductHeader` for the first product, with an image gallery and an "Add to cart" button that does nothing.

The product data in `src/fixtures.ts` is sample data. The images in `public/placeholders/` are placeholder SVGs, not product photos.

### Switching themes

The selected theme is kept in the URL hash, so you can link straight to one, for example <http://localhost:5174/#warm-craft>. An unknown or empty hash falls back to `quiet-luxury`. Changing the theme sets `data-theme` on `<html>` and updates `ThemeProvider`, the same way the website does.

## Run it

Run from the repo root. We run pnpm through npx; the [runbook](../../docs/runbook.md#how-we-run-pnpm) explains why. Install dependencies first with `npx --loglevel=error pnpm@12.16.1 install`.

| What it does | Command |
| --- | --- |
| Start the preview on <http://localhost:5174> | `npx --loglevel=error pnpm@12.16.1 ui:preview` |
| Build a static copy into `apps/ui-preview/dist/` | `npx --loglevel=error pnpm@12.16.1 ui:preview:build` |
| Serve that build on port 5174 | `npx --loglevel=error pnpm@12.16.1 --filter @argiva/ui-preview preview` |
| Type check | `npx --loglevel=error pnpm@12.16.1 --filter @argiva/ui-preview typecheck` |
| Lint (whole repo) | `npx --loglevel=error pnpm@12.16.1 lint` |

The port is set in this package's `package.json` scripts (`vite --port 5174`), not in `vite.config.ts`.

This app has no tests of its own. The components it shows are tested in `@argiva/ui`.

It doesn't need the database or any `.env` file.

## How it fits with other packages

| Depends on | Used for |
| --- | --- |
| `@argiva/ui` | The components, `ThemeProvider`, fonts (`@argiva/ui/fonts`) and global CSS (`@argiva/ui/global.css`). |
| `@argiva/design-tokens` | The theme list (`themeIds`) and `isThemeId()` for the drop-down and URL hash. |

Nothing depends on this app. It is included in the root `build` and `typecheck` runs.

## Rules for contributors

- Use only `--argiva-*` CSS variables for colours. `lint:no-hex` scans `src/` and fails on hex colours.
- Keep sample copy obviously marked as placeholder. Final copy lives in [docs/brand-content.md](../../docs/brand-content.md).
- When you add a component to `@argiva/ui`, add it here too so it can be reviewed in every theme.
- ESLint runs the accessibility (`jsx-a11y`) and React hooks rules on `src/`.

## Related docs

- [DESIGN.md](../../DESIGN.md): the design system in words
- [@argiva/design-tokens README](../../packages/design-tokens/README.md): themes and how to add one
- [ADR 0010: Design tooling](../../docs/adr/0010-design-tooling.md)
- [ADR 0011: Design direction and switchable themes](../../docs/adr/0011-design-direction-themes.md)
- [Runbook](../../docs/runbook.md)
