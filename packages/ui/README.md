# @argiva/ui

ARGIVA's shared React components. The website and the design-system preview both build their pages from these parts. Every colour, font and spacing value comes from `@argiva/design-tokens` as `--argiva-*` CSS variables, so the same components restyle when the theme changes. Some components also read the theme's `ornaments` settings to choose which version to draw, for example the hallmark purity badge or the ghungroo divider.

The package ships TypeScript source (no build step). Apps compile it themselves.

## Entry points

| Import | What you get |
| --- | --- |
| `@argiva/ui` | Components, helpers and `ThemeProvider` (below). |
| `@argiva/ui/global.css` | Theme CSS from `@argiva/design-tokens` plus base page styles (box sizing, body font and colours, heading font, focus outline). Import once at the app root. |
| `@argiva/ui/fonts` | Loads the self-hosted font files (Fontsource) for all themes: Anybody (variable width), Atkinson Hyperlegible, Hanken Grotesk, Marcellus, Mukta and Rozha One. Import once at the app root. |

## Components

| Export | What it is |
| --- | --- |
| `Button` | A `<button>`. `variant`: `primary` (default), `on-dark`, `outline`. Defaults to `type="button"`. |
| `ButtonLink` | A link styled as a button. Needs `href`; same variants. |
| `Divider` | Section divider. Draws the ghungroo (anklet bells) ornament when the theme turns it on for this page or collection (`context={{ page, collection }}`); otherwise a plain rule. `onDark` for dark backgrounds. |
| `Hero` | Large banner: optional eyebrow, title, body, a call-to-action link and an image. The image frame follows the theme's `heroMedia` setting. |
| `Price` | A price in rupees. Takes `paise` (whole number). `size`: `md` or `lg`. |
| `PurityBadge` | Silver purity label, `tone` `sterling` or `alloy`. The style follows the theme's `purityBadge` setting. |
| `ProductCard` | Product tile: image, purity badge, linked name, weight, finish and price. |
| `ProductHeader` | Top of a product page: image gallery with thumbnails, badge, name, price, weight, finish and an add-to-cart button. Client component. |
| `SiteHeader` | Wordmark, main navigation with a mobile "Menu" toggle, and a cart link with item count. Client component. |

Exported types: `ButtonVariant`, `ProductCardProps`, `ProductHeaderProps`, `PurityTone`, `NavItem`, `ImageData` (`{ src, alt, width, height }`), `OrnamentContext`.

## Helpers and theme

| Export | What it does |
| --- | --- |
| `formatInr(paise)` | Formats paise as Indian rupees (`en-IN`). Whole rupees show no decimals; otherwise two. Throws if `paise` is not a safe whole number. |
| `formatWeight(grams)` | Formats a weight such as `24.5 g`, up to two decimals. Throws if not positive. |
| `isInOrnamentScope(scope, ctx)` | True if a theme ornament applies here. Scope entries are `all`, `page:<name>` or `collection:<name>`. |
| `ThemeProvider` | Puts a theme's manifest into React context. Takes `themeId`; defaults to the registry's default theme. |
| `useThemeManifest()` | Reads the current theme manifest (label, fonts, ornaments) inside a component. |

`ThemeProvider` only supplies the manifest to components. The colours come from the `data-theme` attribute on `<html>`, which the app must set to the same theme id. In `@argiva/web` this happens on the server from `DEFAULT_THEME_ID`.

## Commands

Run from the repo root. We run pnpm through npx; the [runbook](../../docs/runbook.md#how-we-run-pnpm) explains why.

| What it does | Command |
| --- | --- |
| Run tests once | `npx --loglevel=error pnpm@12.16.1 ui:test` |
| Run tests in watch mode | `npx --loglevel=error pnpm@12.16.1 --filter @argiva/ui test:watch` |
| Type check | `npx --loglevel=error pnpm@12.16.1 ui:typecheck` |
| Lint (whole repo) | `npx --loglevel=error pnpm@12.16.1 lint` |
| See components in every theme | `npx --loglevel=error pnpm@12.16.1 ui:preview`, then open <http://localhost:5174> |

Tests use vitest with jsdom and Testing Library. Every component test except `Price` also runs an automated accessibility check with axe against WCAG 2.x levels A and AA (`src/test/axe.ts`). Colour contrast is skipped there because jsdom has no layout; the token build checks contrast instead.

## How it fits with other packages

- Depends on `@argiva/design-tokens` for theme CSS, the theme registry and the `ThemeManifest` type.
- Used by `@argiva/web` and `@argiva/ui-preview`.

## Rules for contributors

- Write the test first, including the axe check, then the component.
- Use only `--argiva-*` CSS variables for colour, font, radius and spacing. Hex colours in `src/` fail `lint:no-hex`.
- No hard-coded URLs, domains, emails, phone numbers or prices in `src/`. `lint:hardcoded` checks this. Copy and links come in as props.
- Don't read `process.env`. Components get everything through props or the theme ([ADR 0012](../../docs/adr/0012-config-driven.md)).
- ESLint runs the accessibility (`jsx-a11y`) and React hooks rules on every `.tsx` file.
- Add new components to `src/index.ts` and to the preview app.

## Related docs

- [DESIGN.md](../../DESIGN.md): the design system, components and do's and don'ts
- [@argiva/design-tokens README](../design-tokens/README.md): tokens, themes and rebranding
- [ADR 0010: Design tooling](../../docs/adr/0010-design-tooling.md)
- [ADR 0011: Design direction and switchable themes](../../docs/adr/0011-design-direction-themes.md)
- [Runbook](../../docs/runbook.md)
