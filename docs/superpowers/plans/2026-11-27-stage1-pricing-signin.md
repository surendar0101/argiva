# Stage 1: Pricing Module, Sign-in and Playground Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Invited staff sign in to `/admin`, set up silver categories and pricing rules with Owner approval, and practise pricing safely.

**Architecture:** A pure `@argiva/pricing` package calculates prices. The existing Next.js app gains an `/admin` area using Better Auth on the existing Postgres, with one server-side guard backed by a permission matrix in `@argiva/domain`. The playground runs only in the browser.

**Tech Stack:** TypeScript, Next.js 16.4.3, Drizzle ORM 0.45.4, Better Auth 1.7.x (pin the exact installed version), Vitest 5, Playwright.

**Spec:** [stage 1 design](../specs/2026-11-27-stage1-pricing-signin-design.md) and [agreed requirements](../specs/2026-11-27-admin-pricing-overview.md).

## Global Constraints

- **Never `git commit` or `git push`.** Each task ends with a checkpoint: `git diff --check`, then update `sdd/state.json` (validate it) and append to `sdd/stage-1-pricing-signin.md` (create it).
- Never touch the owner's databases or containers, staging or production. Use a throwaway Postgres you start, and remove only that.
- `pnpm X` means `npx --loglevel=error pnpm@12.16.1 X`.
- Money is integer paise. Weight is integer hundredths of a gram. Percentages are integer basis points. No floating-point money arithmetic.
- Only `@argiva/config` reads `process.env` in `src/`. No secrets in the repository.
- Database migrations only add; the shop and its tests keep working. Do not change `@argiva/domain` pricing.
- Styling uses `--argiva-*` tokens; every screen works at phone and desktop width; WCAG 2.2 AA. Plain English; no technical terms on screen.
- Before writing Next.js code, read the relevant guide in `apps/web/node_modules/next/dist/docs/`.
- Before using a Better Auth API, confirm it in the installed package's types or its documentation. If a call named here does not exist, record a ruling and use the supported equivalent that meets the test.
- Test-first. Watch each new test fail for the stated reason.

## Review Focus

1. A signed-in person without the authenticator step calls a server action directly (not through a screen): refused (Task 6).
2. A Manager's change is approved after the Owner edited the same category: refused, nothing overwritten (Task 8).
3. A coarse rounding step on a tiny price: the result is never ₹0, and with GST off the customer pays exactly the typed price (Task 1).
4. The Owner deactivates a staff member who is signed in: their next request is refused (Task 7).
5. Rupee input such as `1,200.5`, blank, negative or `abc` in a rate or charge field: accepted exactly or rejected with a message, never silently rounded (Task 10).

---

### Task 1: Pricing calculation

**Files:** Create `packages/pricing/{package.json,tsconfig.json,vitest.config.ts,src/index.ts,src/types.ts,src/rounding.ts,src/calculate.ts,src/calculate.test.ts,src/rounding.test.ts}`

**Interfaces:**
- Produces (`@argiva/pricing`, no dependencies):

```ts
export type ChargeBasis = 'fixed' | 'per_gram' | 'percent';
export type PercentBase = 'silver_value' | 'running_total';
export interface ChargeLine {
  id: string; name: string; basis: ChargeBasis;
  value: number;               // paise | paise per gram | basis points
  percentOf?: PercentBase;     // required when basis is 'percent'
  customerVisible: boolean;
}
export type ChargeOverride =
  | { kind: 'change'; id: string; value: number }
  | { kind: 'remove'; id: string }
  | { kind: 'add'; line: ChargeLine };
export interface RoundingRule { stepPaise: 100 | 1000 | 5000; mode: 'nearest' | 'up' }
export interface GstSetting { enabled: boolean; rateBasisPoints: number }
export interface CalculatorInput {
  method: 'calculator';
  weightCentigrams?: number | undefined; ratePaisePerGram?: number | undefined;
  lines: ChargeLine[]; overrides?: ChargeOverride[];
  typedPricePaise?: number | undefined; rounding: RoundingRule; gst: GstSetting;
}
export interface PieceRateInput {
  method: 'piece_rate'; typedPricePaise?: number | undefined; rounding: RoundingRule; gst: GstSetting;
}
export type PriceInput = CalculatorInput | PieceRateInput;
export interface PricedLine { id: string; name: string; amountPaise: number; explanation: string; customerVisible: boolean }
export type PriceResult =
  | { ok: true; lines: PricedLine[]; silverValuePaise: number | null; suggestedPaise: number | null;
      subtotalPaise: number | null; chosenPaise: number; handSet: boolean;
      gstPaise: number; roundOffPaise: number; finalPaise: number }
  | { ok: false; reason: 'missing_rate' | 'missing_weight' | 'missing_price' | 'invalid_input'; detail: string };
export function roundPaise(paise: number, rule: RoundingRule): number;
export function calculatePrice(input: PriceInput): PriceResult;
```

Rules: silver value and each line round half up to a paisa (compute with `BigInt`). `running_total` is silver value plus earlier lines. `roundPaise`: nearest (halves up) or up; if a positive amount would round to 0, return one step. `chosenPaise` is the typed price if given, else the rounded suggestion. `handSet` is true when a calculator item has a typed price different from the suggestion. GST off: `finalPaise = chosenPaise`, `gstPaise = 0`. GST on: `gstPaise` = chosen × rate rounded half up to a paisa; `finalPaise = roundPaise(chosen + gst)`; `roundOffPaise = final − chosen − gst` (may be negative).

- [ ] **Step 1: Write failing tests.** Include exactly:
  - weight 2410, rate 10000, lines fixed 30000 and per_gram 2000: silver 241000, lines 30000 and 48200, subtotal and suggestion 319200.
  - the same with typed 320000: `handSet` true, final 320000.
  - percent of `silver_value` 1000 bp on that item = 24100; of `running_total` after the fixed line = 27100.
  - piece rate 50000, GST on 300 bp, ₹1 nearest: gst 1500, final 51500.
  - piece rate 50500, GST off, step 5000: final 50500.
  - step 5000 nearest on 2000 → 5000; `up` on 319201 with step 100 → 319300; 319250 nearest step 100 → 319300.
  - half paisa: weight 1, rate 50 → silver 1.
  - override change, remove and add; unknown id in change or remove → `invalid_input`.
  - missing weight, rate (undefined or 0) and piece-rate price → the matching reason; negative, non-integer, percent without `percentOf`, duplicate line id, and a result beyond `Number.MAX_SAFE_INTEGER` → `invalid_input`.
  - each priced line has a plain explanation, e.g. `24.1 g × ₹20 per gram`.
- [ ] **Step 2:** `pnpm --filter @argiva/pricing test` → FAIL (module missing).
- [ ] **Step 3:** Implement. **Step 4:** tests and `pnpm typecheck`, `pnpm lint` (add the package to the no-hex and hard-coded-value checks if they list roots) → PASS. **Step 5:** Checkpoint.

### Task 2: Price comparison and module documentation

**Files:** Create `packages/pricing/src/{compare.ts,compare.test.ts}`, `packages/pricing/README.md`

**Interfaces:**
- Produces: `comparePrices(items: Array<{ id: string; before: PriceInput; after: PriceInput }>): ComparisonRow[]` with `ComparisonRow { id; before: PriceResult; after: PriceResult; proposed: PriceResult; handSet: boolean; changed: boolean; selectedByDefault: boolean }`. `after` keeps the typed price; `proposed` is the calculator result without it (equal to `after` for piece rate). `changed` compares `before.finalPaise` with `proposed.finalPaise`; `selectedByDefault = changed && !handSet && proposed.ok`.

- [ ] **Step 1: Failing tests:** rate 10000→11000 on the Task 1 item proposes 343300 and is selected; a typed item is flagged, unticked, and proposes 343300; piece rate unaffected by rate, changed when GST turns on; missing rate in `after` is unselected.
- [ ] **Steps 2–4:** fail, implement, pass.
- [ ] **Step 5:** README: purpose, API, every rule with the worked example above, how to add a charge basis. Checkpoint.

### Task 3: Permission matrix

**Files:** Create `packages/domain/src/{permissions.ts,permissions.test.ts}`; modify `src/index.ts`, README

**Interfaces:** `type AdminRole = 'owner' | 'manager' | 'catalog_editor'`; `type AdminAction = 'pricing.view' | 'pricing.edit' | 'pricing.approve' | 'settings.edit' | 'staff.manage' | 'audit.view'`; `can(role: string, action: AdminAction): boolean`; `changeMode(role: string): 'apply' | 'request' | 'none'`.

- [ ] **Step 1: Table test of every role and action.** Owner: all. Manager: `pricing.view`, `pricing.edit`, `audit.view`. Editor: `pricing.view`. `fulfilment`, `support`, unknown: none. `changeMode`: apply, request, none, none.
- [ ] **Steps 2–5:** fail, implement, pass, checkpoint.

### Task 4: Database tables

**Files:** Modify `packages/db/src/{schema.ts,schema.test.ts,index.ts}`, README; generate `drizzle/0002_*.sql`

**Interfaces:** Drizzle exports `users` (adds `emailVerified`, `image`, `active` default true, `mustChangePassword` default false, `twoFactorEnabled` default false), `sessions` (adds `mfaVerifiedAt`, `lastActiveAt`), `accounts`, `verifications`, `twoFactors`, `rateLimits`, `silverCategories` (`id, name unique, ratePaisePerGram, purity, purityVerified, finish, lines jsonb ChargeLine[], active, version, updatedAt`), `silverRateHistory`, `chargeTemplates` (`id, name unique, lines, version, active`), `pricingSettings` (single row: `roundingStepPaise` 100, `roundingMode` 'nearest', `gstEnabled` false, `gstRateBasisPoints` 300, `gstNumber` null, `version`), `changeRequests` (`id, targetType, targetId nullable, baseVersion, before, after, status 'pending'|'approved'|'rejected'|'superseded', requestedBy, decidedBy, note, createdAt, decidedAt`). `auditLogs` already exists.

Auth table columns must match what the installed Better Auth expects (check its schema generator), with uuid ids and `modelName`/field mapping onto `users`.

- [ ] **Step 1: Failing schema tests** for the tables and columns above. **Step 2:** fail. **Step 3:** implement; `pnpm --filter @argiva/db db:generate`; read the SQL: only `CREATE TABLE` and `ADD COLUMN` with defaults, no drops or renames. **Step 4:** migrate a throwaway database twice; tests pass. **Step 5:** Checkpoint.

### Task 5: Sign-in foundation

**Files:** Modify `packages/config/src/{schema.ts,load.ts,load.test.ts}`, `.env.example`; create `apps/web/src/server/auth/{auth.ts,access.ts,access.test.ts,auth.integration.test.ts}`, `apps/web/src/app/api/auth/[...all]/route.ts`, `apps/web/vitest.integration.config.ts`, `apps/web/test/integration-database.ts`; modify `apps/web/src/instrumentation-node.ts`, `apps/web/package.json`, root `package.json`

**Interfaces:**
- `AppConfig.auth?: { secret: string; google?: { clientId: string; clientSecret: string } }` from `AUTH_SECRET` (min 32 characters), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (both or neither). `requireAuthConfig(config): NonNullable<AppConfig['auth']>` throws `ConfigError`. The web start-up check calls it; migrate and seed do not need the secret.
- `isSignInAllowed(user: { active: boolean } | undefined, provider: 'password' | 'google', emailVerified: boolean): boolean`.
- `getAuth()` (lazy singleton). Root `pnpm test:integration`, using `E2E_POSTGRES_URL` and database `argiva_it_e2e` guarded by `assertTestDatabaseUrl`.

Settings: public sign-up disabled; invite rule applied on user creation, account linking and every sign-in (documented hook `user.validateUserInfo`, else a database hook proven by test); password minimum 12; Google configured only when credentials exist; session expiry 30 minutes extended by activity at most 1 minute apart, no cookie cache; rate limiting and lockout stored in the database.

- [ ] **Step 1: Failing tests.** Config: secret length, Google pair, absent auth allowed by `loadConfig`. Unit: `isSignInAllowed` refuses unknown, inactive, and unverified Google. Integration: sign-up endpoint refused; active user signs in; wrong password repeated until locked or rate-limited (429); inactive user refused; a session untouched past 30 minutes is refused (set its expiry in the database) and an active one is extended; a Google identity (invoke the same hook with a Google source) is refused for an uninvited email.
- [ ] **Steps 2–4:** fail, implement, pass (also `pnpm test`, existing `pnpm e2e` with `AUTH_SECRET` added to `start-server.mjs`, `vitest.setup.ts`, `docker-compose.yml` as a clearly local-only value). **Step 5:** Checkpoint.

### Task 6: Authenticator step and the single guard

**Files:** Create `apps/web/src/server/auth/{guard.ts,guard.test.ts,mfa.ts,mfa.integration.test.ts}`

**Interfaces:**
- `type Viewer = { id: string; name: string; email: string; role: AdminRole }`.
- `evaluateAccess(state, action): 'allow' | 'sign_in' | 'change_password' | 'enrol_code' | 'enter_code' | 'forbidden'` (pure; `state` holds user, session and now).
- `requireAdmin(action: AdminAction): Promise<Viewer>` — the only way pages and actions get a viewer; throws `AdminAccessError(outcome)`.
- `verifyCode(sessionToken, code)` and `verifyBackupCode(sessionToken, code)` set `mfaVerifiedAt`.

Owner and Manager need `mfaVerifiedAt` on the current session for any method. Editors skip it unless enrolled. Order of checks: session, active, password change, code, permission.

- [ ] **Step 1: Failing tests:** each outcome; a Google-created Owner session without `mfaVerifiedAt` → `enter_code`; integration: enrol, wrong code refused and counted, right code allows, backup code works once only, ten codes issued.
- [ ] **Steps 2–5:** fail, implement, pass, checkpoint.

### Task 7: Staff, audit log and the owner command

**Files:** Create `apps/web/src/server/admin/{audit.ts,staff.ts,staff.integration.test.ts}`, `apps/web/scripts/owner.ts`

**Interfaces:** `recordAudit(tx, { userId, action, entityType, entityId, details })` (insert only); `addStaff`, `setRole`, `setActive`, `resetPassword`, `resetAuthenticator` taking `(viewer, input)`; add and reset return `{ temporaryPassword }` once. `pnpm owner -- create|reset-password|reset-code --email <email> [--name <name>]` reads `DATABASE_URL`, refuses `create` if an active Owner exists, prints the password once.

- [ ] **Step 1: Failing integration tests:** only Owner may call; new user must change password; deactivating ends sessions and next `requireAdmin` refuses; last active Owner cannot be deactivated or demoted; every change audited without passwords or codes in `details`; command behaviour including missing `DATABASE_URL`.
- [ ] **Steps 2–5:** fail, implement, pass, checkpoint.

### Task 8: Categories, templates, settings and approvals

**Files:** Create `apps/web/src/server/admin/{categories.ts,templates.ts,settings.ts,change-requests.ts,pricing-admin.integration.test.ts}`

**Interfaces:** `saveCategory(viewer, draft & { id?, expectedVersion? })`, `saveTemplate(...)` return `{ status: 'applied' | 'requested' }`; `saveSettings(viewer, input)` (Owner only; GST on requires a GST number); `listPendingRequests(viewer)`; `decideRequest(viewer, id, 'approve' | 'reject', note?)`; `getPricingSettings(): { rounding: RoundingRule; gst: GstSetting; gstNumber: string | null; version: number }`. Drafts are validated with Zod and by `calculatePrice` accepting the lines.

- [ ] **Step 1: Failing integration tests:** Owner applies and rate history records old, new, who, when; Manager creates a request and nothing changes; approve applies; reject keeps; a newer request supersedes the older pending one; stale `baseVersion` approval refused (Review Focus 2); concurrent approvals apply once; Editor refused; deactivate, never delete; duplicate names refused with a message; no rows pre-filled; audit entries.
- [ ] **Steps 2–4:** fail, implement each change in one transaction with a version check, pass. **Step 5:** Checkpoint.

### Task 9: Admin shell, sign-in and staff screens

**Files:** Create `apps/web/src/app/admin/**` (layout, sign-in, code, enrol, change-password, home, staff), `apps/web/src/components/admin/**`; modify `src/app/layout.tsx` and `robots.ts` so admin pages have no shop header, footer or cart and are never indexed (use route groups)

Screens: side menu on desktop, bottom bar on phones (layout A), listing only Home, Categories, Settings, Playground, Staff, Help as the role allows; sign out. Server actions call `requireAdmin` first. Authenticator enrolment shows a QR code, the text secret and backup codes. Use `qrcode` or similar to draw it locally; never an external service.

- [ ] **Step 1: Failing component tests:** menu per role; Google button hidden without credentials; form errors announced; `robots.txt` disallows `/admin`.
- [ ] **Steps 2–5:** fail, implement, pass; existing shop tests still pass; checkpoint.

### Task 10: Category, settings and approval screens

**Files:** Create `apps/web/src/app/admin/{categories,settings}/**`, approvals on home, `apps/web/src/lib/rupees.ts` and test

**Interfaces:** `parseRupees(text: string): { ok: true; paise: number } | { ok: false; message: string }`; `parsePercent(text)` to basis points the same way.

- [ ] **Step 1: Failing tests:** `1,200.5` → 120050; `0` → 0; blank, `-1`, `abc`, `1.005`, over the safe range → messages; percent `3` → 300, `2.555` refused. Screens: add a category with lines; Manager sees "Sent for approval"; Owner sees old and new values and approves or rejects; Editor sees no edit controls; every field has a one-line explanation.
- [ ] **Steps 2–5:** fail, implement, pass, checkpoint.

### Task 11: Playground, guide and help

**Files:** Create `apps/web/src/app/admin/{playground,help}/**`, `apps/web/src/components/admin/{playground/**,guide/**}`; add `guideDismissedAt` to `users` (new migration) with a server action

**Interfaces:** `practice-store.ts`: `loadPractice(storage)`, `savePractice`, `resetPractice`, samples (toe ring piece rate ₹500; category "Practice 92.5" ₹100 per gram; kada 24.1 g, design ₹300, making ₹20 per gram). `explainChange(row: ComparisonRow): string`.

Playground: **PRACTICE** banner; edit rate, weight, lines, typed price, rounding, GST preview; copy a real category; before and after; sentence such as "Silver went up ₹10 per gram, so this 24.1 g piece rose by ₹241."; practice publish list from `comparePrices`; Reset. Calls only `@argiva/pricing` in the browser; no server action or fetch. Guide: Owner steps category, rounding, playground, ticked from real data; Manager and Editor see their allowed steps; skip and replay.

- [ ] **Step 1: Failing tests:** samples price to ₹3,192 and rate 11000 to ₹3,433 with that sentence; corrupt stored data falls back to samples with a warning; reset; typed items unticked; guide steps per role.
- [ ] **Steps 2–5:** fail, implement, pass, checkpoint.

### Task 12: Browser tests, CI and deployment

**Files:** Create `apps/web/e2e/admin-*.spec.ts`; modify `prepare-database.ts` (test Owner, Manager, Editor with known test passwords and authenticator secrets, only in `_e2e` databases), `playwright.config.ts`, `.github/workflows/{ci.yml,deploy.yml}`, `scripts/{workflows.test.mjs,smoke.mjs,smoke.test.mjs}`, `docker-compose.yml`

- [ ] **Step 1: Failing workflow and smoke tests:** deploy passes `AUTH_SECRET` from Secret Manager (`AUTH_SECRET_NAME` variable) and Google values only when their variables are set; CI runs `pnpm test:integration` in the database job; smoke checks `/admin` redirects to sign-in.
- [ ] **Step 2: Browser tests,** phone and desktop: Owner signs in with password and code; each role's menu; a Manager request then Owner approval; direct request to a forbidden action refused; session expiry returns to sign-in; temporary password must be changed; playground makes no non-GET request and survives reload; axe on every admin screen; admin pages absent from the sitemap.
- [ ] **Step 3:** `pnpm build && pnpm e2e` on a throwaway database; fix faults with a failing test first; ask the owner before any design change.
- [ ] **Step 4:** Confirm the tests can fail: temporarily remove the code check in the guard, see the admin tests fail, restore. Checkpoint.

### Task 13: Documentation and final verification

- [ ] Setup guide: create `AUTH_SECRET` and its secret access for both service accounts, Google OAuth credentials with redirect address `<APP_BASE_URL>/api/auth/callback/google`, the first-Owner command. Runbook: staff, lockouts, resets, secret rotation signs everyone out. READMEs (web, db, domain, config, pricing, root). ADR 0016 pricing (supersedes the modes in 0007 and price approval in 0008) and ADR 0017 admin sign-in; indexes, decisions log, docs index links to the specs and this plan.
- [ ] Update the codebase map in `.ua/` (incremental; if it needs a commit first, say so).
- [ ] Verify on a clean copy: install, build, lint, typecheck, test, test:integration, e2e; build the Docker image and smoke it on an empty database; check Markdown links.
- [ ] One fresh whole-change review; fix Critical and Important findings test-first. Hand over with the owner steps and the Google sign-in check that only the owner can do. Checkpoint.
