# 0011. Design direction and switchable themes

- Status: Accepted
- Date: 2026-10-31
- Deciders: Owner (+ agent)

## Context
Three mood pages were built and compared ([sdd/design/moods/comparison.md](../../sdd/design/moods/comparison.md)). The owner wants one default look and the freedom to switch to the others, or rebrand later, without code changes.

## Options considered
- A. Quiet luxury: oxidised silver, mist and indigo, with a hallmark purity badge.
- B. Warm Indian craft: indigo, khadi and marigold, with a ghungroo chain divider and arched photos.
- C. Modern bold: ink, white and rose gold, with poster-scale type.
- Hard-code one look, or make looks swappable through design tokens.

## Decision
- **A is the default.** B's ghungroo divider appears only on Our Story and the Anklets collection.
- All three ship as standalone themes (`quiet-luxury`, `warm-craft`, `modern-bold`) in `packages/design-tokens`, modelled on linode/design-language-system:
  - **Tokens:** DTCG JSON compiled by Style Dictionary into CSS variables scoped by `[data-theme]`, plus a typed theme registry.
  - **Three tiers:** base scales, then per-theme palette and semantic tokens, then component tokens that reference only semantic tokens.
  - **Ornaments:** the theme manifest's flags (`purityBadge`, `divider`, `dividerScope`, `heroMedia`) pick the signature component variants.
- **Rebrand pipeline:** `pnpm tokens:new <id> --from <theme>`, edit the JSON, then `pnpm tokens:build`. The build checks the token contract and WCAG AA contrast. CI runs it in `.github/workflows/design-tokens.yml`.
- **Switching:** the Owner picks among the built themes in Admin > Appearance, with a preview and an audit log entry. Admins can never upload raw CSS.
- **Guiding phrase:** "The Silversmith's Ledger". The accessibility target is WCAG 2.2 AA.

## Consequences
- Switching themes needs no rebuild or redeploy; the app sets `<html data-theme>` from a site setting.
- Components must never contain hex values; a lint rule will enforce this.
- Only the active theme's fonts are loaded, and they are self-hosted.
