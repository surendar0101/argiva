# @argiva/design-tokens

ARGIVA's design language: every colour, font, radius and spacing value used by the storefront and admin comes from here. The structure follows [linode/design-language-system](https://github.com/linode/design-language-system): JSON tokens in the [DTCG format](https://tr.designtokens.org/format/), compiled with [Style Dictionary](https://styledictionary.com/).

## Token tiers

| Tier | Location | Per theme? | Rule |
|---|---|---|---|
| Base | `tokens/base/` | No | Spacing, type scale, motion. Shared by all themes. |
| Palette | `tokens/themes/<id>/tokens.json` → `palette` | Yes | Raw colours. Never used directly by UI code and not emitted to CSS. |
| Semantic | `tokens/themes/<id>/tokens.json` → `color`, `font`, `radius` | Yes | Meaning-based (`color.action.bg`). Every theme must define the same set. |
| Component | `tokens/components/` | No | Reference semantic tokens only, so components restyle automatically. |

UI code uses `--argiva-color-*`, `--argiva-component-*` and the base variables, and nothing else. Hardcoded hex values in components are a review failure.

## Themes

| id | Look | Default |
|---|---|---|
| `quiet-luxury` | Oxidised silver, mist, indigo; hallmark purity badge; ghungroo divider only on Our Story and Anklets | Yes |
| `warm-craft` | Indigo cloth, khadi, marigold; arched hero; ghungroo dividers everywhere | No |
| `modern-bold` | Black and white, rose-gold accent; condensed poster type | No |

`theme.json` holds each theme's label, fonts and `ornaments`. The ornament flags tell the UI which version of a signature component to render, for example the hallmark purity badge or plain text.

## How theme switching works

- `dist/css/argiva.css` contains every theme, each scoped to `[data-theme="<id>"]`. The default theme also applies on `:root`.
- The app renders `<html data-theme="…">` from the active-theme site setting. Changing the setting restyles the site on the next page load, with no rebuild or redeploy.
- `dist/index.js` exports `themes`, `themeIds`, `defaultThemeId`, `isThemeId()` and `getTheme()`. The admin Appearance page lists themes from this registry, and the server rejects any id not in it.
- Admins can only pick a theme that has been built and validated. They cannot upload raw CSS, which blocks CSS injection and broken contrast.

## Rebrand workflow

```sh
pnpm tokens:new festive-2027 --from quiet-luxury   # copy a theme as a starting point
# edit tokens/themes/festive-2027/tokens.json (palette, then semantic) and theme.json
pnpm tokens:build                                    # validate + build
open packages/design-tokens/dist/preview.html#festive-2027
```

`pnpm tokens:build` fails if any theme:
- is missing a semantic token or adds an extra one,
- has a broken reference or a colour that is not a hex value,
- fails WCAG AA contrast: 4.5:1 for text, 3:1 for focus rings and input borders, across 22 colour pairs.

CI ([.github/workflows/design-tokens.yml](../../.github/workflows/design-tokens.yml)) runs the same build on every pull request that touches tokens and uploads `dist/` (including `preview.html`) as an artifact for review.

To change an existing theme, edit its `tokens.json` and run `pnpm tokens:build`. To add a new semantic token, add it to every theme. The contract check enforces this.

## Local setup note

Corepack can't download pnpm through the corporate npm mirror. Use `npx pnpm@12.16.1 <command>` or `npm i -g pnpm@12.16.1`.
