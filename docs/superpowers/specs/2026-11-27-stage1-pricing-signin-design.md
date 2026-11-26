# Stage 1 design: pricing module, sign-in and playground

Status: **approved by the owner** (27 November 2026). Read with the [agreed requirements](2026-11-27-admin-pricing-overview.md).

## Intent

Let the owner sign in securely, set up silver categories and charges, and practise pricing, so the pricing rules are proven before products depend on them.

## Goals

1. A pricing module that calculates exactly what the owner configured, and explains each result.
2. A dashboard at `/admin` that only invited people can enter, with permissions enforced on the server.
3. Silver categories, charge lines, templates, rounding and GST settings, with Owner approval for Manager changes.
4. A practice area and a first-time guide.

## Non-goals

Products, pieces, stock and photos (stage 2). Review and publish of product prices, bulk changes, offers and a history screen (stage 3). Any change to what shoppers see (stage 4). Email of any kind.

## Anti-goals

- A price rule the owner did not configure.
- Practice values reaching real settings or the shop.
- A permission enforced only by hiding a button.

## Constraints

- Money is integer paise. Calculations use integers only: weight in hundredths of a gram, percentages in hundredths of a percent.
- Admin reads and writes go through one central permission check, following the [approved matrix](../../../sdd/phase-0-discovery.md).
- Settings and secrets through `@argiva/config`; secrets only in Secret Manager or local untracked files.
- Database changes are additive; the current shop keeps working. The old pricing code stays until stage 4.
- Styling uses `--argiva-*` tokens; phones and computers are equally supported; WCAG 2.2 AA.
- Test-first, with browser tests. No commits by the agent. No changes to staging or production data by the agent.

## Approaches

For the playground:

| Approach | Trade-off |
| --- | --- |
| **Runs in the browser with the same pricing module (chosen)** | Cannot touch real data by design; practice is per device and not shared |
| Practice copy in the database | Shareable, but needs separation rules everywhere and can leak into real data |

For sign-in:

| Approach | Trade-off |
| --- | --- |
| **Better Auth with our own role checks (chosen; decided in Phase 0)** | Proven password, Google and authenticator support; we add the second step for Google and the invite rule |
| Our own sign-in | Full control, but security code we would have to get right ourselves |
| Hosted sign-in service | Less to build, but another account and possible cost |

The build order (pricing and playground first) was chosen by the owner over foundations-first and one combined build.

## Design

### 1. Pricing module (`packages/pricing`)

Pure code: no database, screens, clock or settings of its own. Everything is passed in.

- **Inputs:** weight; category rate per gram; ordered charge lines (stable id, name, basis `fixed`, `per gram` or `percent`, value, percent base `silver value` or `total of lines above`, whether it may be shown to customers); product or piece changes to those lines (change, remove, add); rounding rule; GST setting.
- **Calculation:**
  1. silver value = weight × rate, rounded half up to a paisa;
  2. each line in order, rounded half up to a paisa;
  3. subtotal = silver value + lines;
  4. suggested price = subtotal rounded by the rule;
  5. final amount = chosen price (suggested or typed) plus GST when on, rounded by the same rule.
- **Piece rate:** only step 5, from the typed price.
- **Rounding rule:** step of ₹1, ₹10 or ₹50; nearest (halves up) or up.
- **Output:** every line with its amount and a plain-English explanation, plus suggested, chosen and final amounts, or a reason why no price can be given (missing rate or weight). Never a guessed amount.
- Negative values, non-whole inputs and results beyond the safe number range are rejected with a reason.
- A comparison function returns old and new results for a set of items after a settings change, marking typed prices. Stage 3 and the playground use it.
- Its README documents every rule with a worked example, and how to add a new charge basis.

### 2. Sign-in and roles

- `/admin` is separate from the shop, never indexed by search engines, and every page and action checks the session and permission on the server.
- **First Owner:** a command run by the owner creates it and shows a one-time temporary password. The same command can reset the Owner's password or authenticator.
- **Staff:** the Owner adds name, email and role, and gets a one-time temporary password to hand over. It must be changed at first sign-in. The Owner can reset passwords and authenticators, change roles and deactivate people; deactivation ends their sessions at once. The last active Owner cannot be removed.
- **Google:** allowed only for an added, active email that Google reports as verified. The button is hidden until Google credentials are configured.
- **Authenticator code:** required for Owner and Manager before any admin page, after password **or** Google. The library does not do this for Google by default, so the permission check requires a session marked as code-verified. Ten single-use backup codes.
- **Idle sign-out:** after 30 minutes without activity.
- Passwords at least 12 characters. Repeated wrong passwords or codes are slowed and locked temporarily, with the counters kept in the database.
- **Audit log:** sign-ins, failures, staff changes, settings changes and approvals; add-only. Owner and Manager can read it in the database; the screen comes in stage 3.

### 3. Categories, charges and settings

- Screens for silver categories (name, rate per gram, purity, finish, purity verified, charge lines, active) and reusable charge templates. Purity and finish use the existing labelling values.
- Owner: changes apply at once. Manager: changes become requests showing old and new values; the Owner approves or rejects with an optional note. A newer request for the same item replaces the older one; approving a request whose item has since changed is refused. Catalog Editor: view only.
- Owner only: rounding rule, GST on or off, GST rate, GST number (required to switch GST on).
- Categories are deactivated, not deleted. Rate history is kept.
- No rates or categories are pre-filled.

### 4. Dashboard, guide and playground

- Layout A: side menu on computers, bottom bar on phones. Only built sections appear.
- Home: checklist, approvals waiting. Low stock and drafts arrive with stage 2.
- Guide: shown at first sign-in, per role, skippable and replayable. Stage 1 steps for the Owner: create a silver category, set rounding, try the playground. Product steps are added in stage 2. Short explanations beside each field and a Help page with worked examples.
- Playground: marked **PRACTICE** on every screen. Starts with a sample piece-rate toe ring and a calculator kada with made-up rates. Everything is editable, real categories can be copied in, before and after are shown with a sentence explaining the difference, a practice "publish" shows the review list, and Reset restores the samples. It sends nothing to the server and is kept only on that device.

### 5. Setup, deployment and documentation

- New settings: a sign-in secret (required), Google client id and secret (optional, together). The deploy workflow and setup guide gain them. Local development works without Google.
- The owner creates the secret and Google credentials; the setup guide gives each step. The first-Owner command is run by the owner against the intended database.
- Documentation: pricing module README, setup, runbook (accounts, lockouts, resets), app and package READMEs, ADRs replacing the pricing parts of ADR 0007 and 0008 and recording the sign-in design, docs index, decisions log, and the codebase map.

## Done when

- Every pricing rule above has tests, including worked examples with exact paise.
- Browser tests cover: sign-in by password with code, the role limits (including direct requests without the button), Manager request and Owner approval, idle sign-out, an uninvited email refused, and the playground sending nothing to the server.
- Google sign-in is covered by automated tests with a stand-in; the owner confirms the real one once credentials exist.
- The existing shop tests still pass, and fresh build, lint, typecheck and tests pass on a clean copy.

## Left to the builder

File layout, table and column names, library versions, the authenticator QR code library, exact wording (plain English) and the order of tasks.
