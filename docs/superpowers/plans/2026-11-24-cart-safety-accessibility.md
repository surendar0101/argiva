# Phase 4 Cart Safety and Accessibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Keep changes uncommitted; never git commit or git push.

**Goal:** Reject invalid persisted cart prices and make the cart drawer operable as an accessible modal.

**Architecture:** Tighten the existing cart-item storage guard to require non-negative safe-integer paise. Use the native modal dialog for focus containment and Escape handling, while synchronizing open state and restoring focus to the opener.

**Tech Stack:** TypeScript, React, Vitest, Testing Library, native HTML dialog.

**Spec:** [2026-11-24-phase-4-review-followup-design.md](../specs/2026-11-24-phase-4-review-followup-design.md).

## Global Constraints

- Preserve existing cart persistence, line-item controls, backdrop dismissal, and memory fallback.
- Keep money in integer paise.
- Do not add dependencies or change checkout behavior.
- Leave all changes uncommitted; never git commit or git push.

## Review Focus

1. Fractional persisted paise are discarded.
2. Unsafe integer persisted paise are discarded.
3. A valid non-negative safe integer remains accepted.
4. Escape closes the modal and synchronizes the cart's open state.
5. Focus enters the dialog on open and returns to the opener on close.

---

### Task 1: Require Safe-Integer Cart Prices

**Files:**
- Modify: `apps/web/src/components/cart/cart-context.tsx`
- Test: `apps/web/src/components/cart/cart-context.test.tsx`

**Interfaces:**
- Consumes: the existing private `isCartItem(value: unknown): value is CartItem` storage guard.
- Produces: a storage guard that accepts `pricePaise` only when `Number.isSafeInteger(pricePaise)` and `pricePaise >= 0`.

- [ ] **Step 1: Add failing persisted-cart tests**

Add tests named `ignores_fractional_persisted_price` and `ignores_unsafe_integer_persisted_price`, plus a valid-safe-integer case. Assert invalid entries are excluded and the valid entry remains in the cart.

- [ ] **Step 2: Run the focused cart-context tests and confirm failure**

Run: `npx --loglevel=error pnpm@12.16.1 --filter @argiva/web test cart-context.test.tsx`

Expected: the fractional and unsafe-integer cases are incorrectly accepted.

- [ ] **Step 3: Tighten the stored-price guard**

Require `Number.isSafeInteger(value.pricePaise)` while retaining the existing non-negative check and malformed-entry warning behavior.

- [ ] **Step 4: Run the cart-context tests**

Run: `npx --loglevel=error pnpm@12.16.1 --filter @argiva/web test cart-context.test.tsx`

Expected: PASS, including existing persistence and storage-failure tests.

### Task 2: Make the Cart Drawer a Native Modal

**Files:**
- Modify: `apps/web/src/components/cart/cart-drawer.tsx`
- Modify: `apps/web/src/components/cart/cart-drawer.module.css`
- Test: `apps/web/src/components/cart/cart-drawer.test.tsx`

**Interfaces:**
- Consumes: `useCart()` open/close state and existing drawer content.
- Produces: a named native `<dialog aria-modal="true">` opened with `showModal()`, closed in sync with cart state, with focus restoration to the previous active element.

- [ ] **Step 1: Add failing drawer behavior tests**

Test that the open drawer is a named modal dialog with `aria-modal="true"`, calls `showModal()`, focuses its close button, closes on Escape/cancel, restores focus to the opener, and still closes from its close button and backdrop. Stub `HTMLDialogElement.showModal` and `close` where the test DOM does not implement them.

- [ ] **Step 2: Run the focused drawer tests and confirm failure**

Run: `npx --loglevel=error pnpm@12.16.1 --filter @argiva/web test cart-drawer.test.tsx`

Expected: FAIL because the current `<aside role="dialog">` has no modal semantics or focus handling.

- [ ] **Step 3: Implement native modal and synchronized focus behavior**

Replace the custom aside/overlay structure with the native modal dialog, label it by the cart heading, set `aria-modal="true"`, focus the close control on open, handle `cancel` through `closeDrawer`, and restore focus to the captured opener when the dialog closes. Preserve line-item controls and outside-click dismissal.

- [ ] **Step 4: Update dialog styles with existing tokens**

Style the dialog and backdrop using existing `--argiva-*` tokens; preserve the current slide-over placement and responsive width.

- [ ] **Step 5: Run drawer and cart tests**

Run: `npx --loglevel=error pnpm@12.16.1 --filter @argiva/web test cart-drawer.test.tsx cart-context.test.tsx`

Expected: PASS, including modal keyboard and focus assertions.
