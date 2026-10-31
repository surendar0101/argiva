---
name: ARGIVA Silvers
description: Modern Silver. Timeless Stories. Default theme "quiet-luxury"; tokens are generated from packages/design-tokens.
colors:
  oxide: "#1D2422"
  oxide-raised: "#26302D"
  ink-soft: "#4C5753"
  silver: "#A7AEAB"
  hairline: "#D5DAD7"
  mist: "#EEF0EE"
  paper: "#F8F9F8"
  white: "#FFFFFF"
  indigo: "#2F3B5E"
  indigo-deep: "#24304D"
  indigo-light: "#C9D2EA"
  success-green: "#2E6B4F"
  error-red: "#A23B2D"
  warning-amber: "#8A5A00"
typography:
  display:
    fontFamily: "Marcellus, Georgia, serif"
    fontSize: "clamp(2.4rem, 6vw, 5rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Marcellus, Georgia, serif"
    fontSize: "clamp(2rem, 4vw, 3.2rem)"
    fontWeight: 400
    lineHeight: 1.3
  title:
    fontFamily: "Marcellus, Georgia, serif"
    fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)"
    fontWeight: 400
    lineHeight: 1.3
  body:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.3
  wordmark:
    fontFamily: "Marcellus, Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    letterSpacing: "0.18em"
rounded:
  none: "0"
  control: "0.125rem"
  badge: "0.125rem"
spacing:
  "1": "0.25rem"
  "2": "0.5rem"
  "3": "0.75rem"
  "4": "1rem"
  "5": "1.5rem"
  "6": "2rem"
  "7": "3rem"
  "8": "4rem"
  "9": "6rem"
  section: "clamp(2.5rem, 7vw, 5rem)"
  gutter: "clamp(1rem, 5vw, 4rem)"
components:
  button-primary:
    backgroundColor: "{colors.indigo}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "0.9rem 1.6rem"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "{colors.indigo-deep}"
    textColor: "{colors.paper}"
  button-on-dark:
    backgroundColor: "{colors.mist}"
    textColor: "{colors.oxide}"
    rounded: "{rounded.control}"
    padding: "0.9rem 1.6rem"
    height: "2.75rem"
  button-on-dark-hover:
    backgroundColor: "{colors.white}"
    textColor: "{colors.oxide}"
  purity-badge:
    textColor: "{colors.indigo}"
    typography: "{typography.label}"
    padding: "0.3rem 0.55rem 0.25rem"
    rounded: "0 0 {rounded.3} {rounded.3}"
  product-card-media:
    backgroundColor: "{colors.mist}"
    rounded: "{rounded.none}"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.oxide}"
    rounded: "{rounded.control}"
    height: "2.75rem"
  input-selected:
    backgroundColor: "{colors.indigo}"
    textColor: "{colors.paper}"
  hero:
    backgroundColor: "{colors.oxide}"
    textColor: "{colors.mist}"
---

# Design System: ARGIVA Silvers

> **Source of truth:** values come from [packages/design-tokens](packages/design-tokens/README.md). The frontmatter above mirrors the default theme, `quiet-luxury`. If the two disagree, the token package wins; update this file after changing tokens. UI code reads only `--argiva-*` CSS variables and never uses hex literals.

## Overview

**Creative North Star: "The Silversmith's Ledger"**

A jeweller's record book is exact and unhurried. It notes what each piece is made of, what it weighs and what it costs, in a steady hand. ARGIVA's interface works the same way. Product facts (purity, finish, weight, price) are set down plainly and stay where the eye expects them. The brand's warmth comes from the family story and the silver itself, not from decoration. Pages are calm and well-spaced, with a dark, oxidised-silver tone for story and hero moments and light paper tones for shopping.

Ornament is rationed. The hallmark-stamp purity badge appears on every product, because it carries a fact. The ghungroo chain divider, borrowed from the warm-craft mood, appears only on Our Story and the Anklets collection, where the anklet heritage is the subject.

Three themes share one structure: `quiet-luxury` (default), `warm-craft` and `modern-bold`. Each one supplies the same 40 semantic tokens. Components never know which theme is active.

**Key Characteristics:**
- Facts first: purity, weight, finish and price are always visible on cards and product pages.
- Dark story and hero sections, light shopping pages.
- One accent (indigo) for actions; everything else is silver-grey neutrals.
- Flat surfaces, hairline borders, square photo frames.
- Restrained motion: slow image zoom on hover, nothing that bounces.

## Colors

Cool oxidised-silver neutrals with a single deep indigo accent.

### Primary
- **Temple Indigo** (#2F3B5E): primary buttons, selected filter chips, focus rings and the purity badge. It is the only colour that means "act here" or "this is a fact".
- **Deep Indigo** (#24304D): hover and pressed state of primary actions.
- **Indigo Haze** (#C9D2EA): focus ring on dark surfaces.

### Neutral
- **Oxidised Silver** (#1D2422): primary text; background of hero and story sections.
- **Oxide Raised** (#26302D): raised panels inside dark sections.
- **Patina Grey** (#4C5753): muted text, strong borders, ornament strokes on light surfaces.
- **Polished Silver** (#A7AEAB): muted text and ornaments on dark surfaces only. It fails contrast on light surfaces.
- **Hairline** (#D5DAD7): default borders and dividers.
- **Mist** (#EEF0EE): product image backdrops, muted sections, text on dark surfaces.
- **Paper** (#F8F9F8): page background.
- **White** (#FFFFFF): inputs and raised cards.

### Feedback
- **Verdigris Green** (#2E6B4F) success, **Rust Red** (#A23B2D) error, **Tarnish Amber** (#8A5A00) warning. Always pair these with text or an icon.

### Named Rules
**The One Accent Rule.** Indigo is reserved for actions, focus and purity facts. Never use it for decoration or large background fills on shopping pages.

**The Contrast Gate Rule.** A colour pair ships only if `pnpm tokens:build` passes its WCAG AA check (4.5:1 for text, 3:1 for UI). Never bypass the check.

## Typography

**Display Font:** Marcellus (with Georgia, serif)
**Body Font:** Hanken Grotesk (with system-ui, sans-serif)

**Character:** Marcellus has the engraved, Roman-capital calm of a maker's mark. Hanken Grotesk is a clear, modern sans that keeps prices and specs readable on small phones.

### Hierarchy
- **Display** (400, clamp(2.4rem, 6vw, 5rem), 1.05): hero headlines only, one per page.
- **Headline** (400, clamp(2rem, 4vw, 3.2rem), 1.3): page titles such as collection names and Our Story chapters.
- **Title** (400, clamp(1.8rem, 3.5vw, 2.6rem), 1.3): section heads.
- **Body** (400, 1rem, 1.6): running text, with a maximum line length of 38rem.
- **Label** (500, 0.8125rem): badges, filter labels and metadata.
- **Wordmark** (Marcellus, letter-spacing 0.18em, uppercase): the ARGIVA logotype only.

### Named Rules
**The Ledger Numerals Rule.** Prices, weights and percentages use `font-variant-numeric: tabular-nums` and weight 600, so figures line up and read as facts.

## Layout

- Content is at most 80rem wide, with fluid side gutters of clamp(1rem, 5vw, 4rem). Vertical rhythm between sections is clamp(2.5rem, 7vw, 5rem).
- Product grids use `repeat(auto-fill, minmax(min(100%, 15rem), 1fr))` with a 2.5rem row gap and a 1.5rem column gap: one column on small phones, two from about 32rem wide, and more on wider screens.
- The hero is two columns on desktop (text + photo) and stacks below about 860px, with the photo first.
- The product page uses a 1.2fr gallery beside a 1fr details column, stacked on mobile. Gallery thumbnails sit in a 4.5rem rail.
- Spacing comes only from the `space-1…9` scale.

## Elevation & Depth

Flat. Depth comes from tonal layering (Paper → White → Mist on light pages; Oxide → Oxide Raised on dark ones) and from hairline borders, not shadows. A thin inset border inside hero photos frames them like a display case.

### Named Rules
**The No-Shadow Rule.** Surfaces carry no box-shadow at rest or on hover. Use a tone shift or a border change to show state.

## Shapes

Near-square. Controls and badges have a 2px radius (0.125rem). Product and hero photos have square corners. The only curved form is the hallmark badge: a flat top with rounded bottom corners (0 0 0.8rem 0.8rem), like a punched silver stamp. Other themes may change the hero photo frame (warm-craft uses an arch) through the theme manifest's `heroMedia` flag, not through component code.

## Components

### Buttons
- **Character:** quiet and decisive.
- **Shape:** 2px radius, 1px border in `currentColor`; minimum height 2.75rem (44px tap target).
- **Primary (light pages):** Temple Indigo background, Paper text, 0.9rem × 1.6rem padding, Hanken Grotesk 500 at 0.95rem.
- **On dark:** Mist background with Oxidised Silver text. Hover lightens to White.
- **Outline:** transparent background with an inherited border. Hover fills it with the solid style.
- **Focus:** a visible 2px focus ring in the theme's focus token (Indigo on light, Indigo Haze on dark).

### Purity Badge (signature)
- **Hallmark variant (default theme):** sits in the top-left of the product photo. Marcellus at 0.8rem with 0.06em tracking. Indigo text and a 1px indigo border on 85% Paper, with the stamp shape described in Shapes.
- **Sterling vs alloy:** 92.5% uses a solid border. 80% and 60% use a **dashed** border plus the explicit percentage text, so the difference never depends on colour alone.
- Text comes from the variant's verified composition. Never render "925" for an unverified item.

### Product Cards
- **Media:** 4:5 photo on Mist, square corners. On hover the image scales to 1.06 over 600ms (only when reduced motion is not requested).
- **Body:** name in Hanken Grotesk 500 at about 1.02rem. A meta row shows weight and finish in Patina Grey on the left and the price on the right, set in tabular numerals at 600.
- No shadow, no border. The photo is the container.

### Inputs / Filters
- **Fields:** White background, 1px Patina Grey border, 2px radius, at least 2.75rem tall.
- **Selected chip or option:** Indigo background with Paper text.
- **Error:** a Rust Red border plus a text message below; never colour alone.

### Navigation
- Wordmark on the left. Collections, Our Story and cart on the right. On mobile it collapses to a menu button.
- The cart link's visible text and its accessible name must match.

### Ghungroo Divider (scoped ornament)
- An SVG chain of small bells. On load it draws in over the `slow` duration; it stays still under reduced motion.
- **Only** on Our Story and the Anklets collection, as set by the theme manifest's `dividerScope`. Everywhere else, use a plain hairline rule.

## Do's and Don'ts

### Do:
- **Do** read colours, type and radii only from `--argiva-*` variables generated by `packages/design-tokens`.
- **Do** show purity, finish, weight and price on every product card and product page.
- **Do** keep tap targets at 2.75rem or larger and keep visible focus rings.
- **Do** guard all motion, including smooth scrolling, with `prefers-reduced-motion`.
- **Do** use placeholders that meet contrast until ARGIVA's own photography exists.

### Don't:
- **Don't** hard-code hex values, font names or radii in components; add or extend a token instead.
- **Don't** use shadows, gradients on UI surfaces, or glassmorphism.
- **Don't** spread the ghungroo divider beyond Our Story and Anklets.
- **Don't** describe 80% or 60% items as sterling, or imply solid rose gold.
- **Don't** use Polished Silver (#A7AEAB) text on light surfaces.
- **Don't** use stock or third-party retailer jewellery photos.
