# Phase 1 — Design system log

Plan: [docs/plans/2026-10-31-phase-1-design-system.md](../docs/plans/2026-10-31-phase-1-design-system.md)

Started 2026-10-31 after the owner approved Phase 0 ("Proceed"). Each task is done by a fresh helper agent; the controller re-runs the tests before marking it complete. Nothing is committed.

## Ledger
- Task 1: complete. `packages/ui` with Vitest, jsdom, Testing Library and an axe helper; `tsconfig.base.json`; root scripts `ui:test` and `ui:typecheck`.
- Task 2: complete. `scripts/check-no-hex.mjs` and its test (4 pass); `lint:no-hex` script.
- Task 3: complete. `formatInr`, `formatWeight` and `isInOrnamentScope`, with 12 tests.
- Verified by the controller: 13 tests pass, typecheck exit 0, no-hex 4/4 pass. No changes from the plan's code. Installs pulled new majors (TypeScript 7, Vitest 5, jsdom 30), and all pass.
- Task 4: complete. `ThemeProvider` and `useThemeManifest`, `global.css`, `fonts.ts` (Fontsource 5.3.0). Token fix: the modern-bold display font is now `"Anybody Variable"`, to match the Fontsource family name. `tokens:build` passes.
- Task 5: complete. `Button` and `ButtonLink`, 3 tests.
- Task 6: complete. `PurityBadge` (hallmark or text variant; sterling or alloy tone), 4 tests.
- Task 7: complete. `Price` as a `<data>` element with ledger numerals, 1 test.
- Verified by the controller: 23 tests pass, typecheck exit 0. No changes from the plan's code.
- Tasks 8–12: complete. ProductCard (4 tests), Divider and Ghungroo (5), SiteHeader (4), Hero (3), ProductHeader (4), and `types.ts` with `ImageData`. Verified by the controller: 43 tests pass, typecheck exit 0. No changes from the plan's code and no React warnings.
- Task 13: complete. `apps/ui-preview` (Vite 8.3.5) with a theme switcher (`#<theme-id>`), placeholder SVGs, a `typecheck` script, and root scripts `ui:preview` and `ui:preview:build`.
  - Changes from the plan: nav fixtures use `#collections` and `#our-story` instead of `#`.
  - Fix in `SiteHeader`: the React key is now `href|label`, so two links with the same href no longer clash.
  - Known preview-only quirks: clicking a nav hash link resets the theme on reload, and there are two `<h1>` elements by design.
  - Verified: 43 tests pass, the preview build passes and its typecheck exits 0.
- Task 14 (in progress), steps 1-4 and 6-8 done:
  - 9 screenshots; axe found 0 WCAG violations in all 9 checks.
  - Impeccable fixes: button font-size now uses a token, hallmark radius is now 0.75rem, and the preview no longer shows the eyebrow.
  - New file: `docs/design/imagery.md`. Updated: DESIGN.md (purity badge `rounded`).
  - Final checks: tokens valid (3 themes, 40 tokens, 22 contrast checks), 43/43 tests pass, typecheck 0, no-hex 0, the check-no-hex tests pass 4/4, the preview build passes and its typecheck is 0.
  - See `sdd/design/phase-1/findings.md`. Lighthouse is still pending.
- Task 14: complete.
  - Lighthouse: mobile 100/100/96 (performance/accessibility/best practices; LCP 1.6 s, CLS 0); desktop 100/100/96. The only point lost is the preview's missing favicon.
- Phase 1: done (2026-10-31). The owner approved the design by saying "Proceed with phase 2". Defaults applied to the two open questions, both changeable later:
  - The Hero keeps its optional eyebrow prop, but the preview doesn't use it.
  - Warm-craft keeps the mist page background.
