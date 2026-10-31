# Phase 1 visual verification findings

Date: 2026-10-31. Checked against the preview app (`pnpm ui:preview`), themes `quiet-luxury`, `warm-craft` and `modern-bold`.

## 1. Screenshots
- There are 9 full-page screenshots: `<theme>-<width>.png` at widths 375, 768 and 1280.
- They were captured with reduced motion turned on, so the colours shown are the final ones and not mid-animation.

## 2. Reduced motion and keyboard
- **Reduced motion:** with it on, the page runs 0 animations (no hero rise, no ghungroo draw, no image zoom) and button transitions last 0s.
- **Focus rings:** `:focus-visible` gives every focusable element a 2px solid outline. On dark surfaces (the hero and on-dark buttons) the outline uses the inverse colour. Product cards show the ring on the stretched link's `::after`.
- **Tab order** (from the page structure; nothing uses a positive `tabindex`):
  - theme picker, wordmark, Collections, Our Story, Cart
  - the hero action "Shop the collection"
  - the 4 product cards
  - the 2 gallery thumbnails
  - "Add to cart"
  - This matches the order in the plan.
- **Limitation:** the integrated browser runs headless, so pressing Tab there does not move focus. The tab order was therefore read from the page's HTML rather than tested by pressing keys. The owner should do a manual Tab pass during review.

## 3. axe-core (WCAG 2.0, 2.1 and 2.2 A/AA, with colour contrast on)
- There were 0 violations in all 9 theme and width combinations.
- **Purity badges on top of the placeholder images:** they pass contrast.
- **Two `<h1>` headings:** axe did not flag this under the WCAG rule set. It is a known quirk of the preview page only.
- **"region" note:** the best-practice rule set reports that the preview's theme toolbar sits outside any landmark. This is preview only and will not appear on the real site.
- **False alarm, explained:** an early run reported warm-craft "Add to cart" at a contrast of 1.34. Cause: the theme is applied after the page first renders, so the button starts a 150ms colour transition. The hidden browser tab froze that transition at the quiet-luxury colour. The tokens themselves pass. With reduced motion on, or in a visible tab, there was no violation. **Phase 2 must set `data-theme` on the server** (this is already planned), so real pages never show this flash.

## 4. Impeccable
- **Code scan (`impeccable detect src`):** 0 anti-patterns. It made 2 advisory notes; both are fixed:
  - Button font-size was 0.95rem, which is not on the type ramp. It now uses `--argiva-font-size-md` (1rem).
  - The hallmark badge corner radius was 0.8rem. It is now 0.75rem, which matches `rounded.3`. DESIGN.md now documents the badge shape.
- **Live-page scan (`detect http://localhost:5174/#warm-craft`):**
  - The kicker label above the hero heading was flagged. The placeholder eyebrow is now removed from the preview. The `Hero` component still accepts an optional `eyebrow`. **Owner decision:** keep the prop, or remove it?
  - The cream/beige page background was flagged. warm-craft's page colour (`#E6E3DA`, "mist") comes from the agreed palette in the token package and was chosen on purpose, not as a default. It is left unchanged; the owner can confirm or ask for a change during review.

## 5. Lighthouse
- Run against the production preview build (`vite preview`, port 4174), page `#quiet-luxury`.
- Scores:

| Run | Performance | Accessibility | Best practices | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| Mobile | 100 | 100 | 96 | 0.8 s | 1.6 s | 0 ms | 0 |
| Desktop | 100 | 100 | 96 | 0.2 s | 0.2 s | 0 ms | 0 |

- Both runs meet the targets (accessibility 100, mobile performance at least 90).
- Best practices lost points for one reason: the preview has no `favicon.ico`, so the browser logs a 404. This affects the preview only; the real site gets a favicon in Phase 4.
- Raw reports: `lighthouse-mobile.json` and `lighthouse-desktop.json`.

## 6. Other changes made during Task 14
- `SiteHeader` now builds each nav item's React key from both its href and its label. Two links with the same href no longer clash.
