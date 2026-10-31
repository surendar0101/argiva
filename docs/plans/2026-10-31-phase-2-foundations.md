# Phase 2: Foundations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking. **Never `git commit` or `git push`.** Each task ends with a checkpoint instead: update `sdd/state.json`, append to `sdd/phase-2-foundations.md`, and leave the change for the owner to review.

**Goal:** Build the running skeleton of the shop. That means a Next.js app (`apps/web`) that uses the Phase 1 design system, typed config that fails fast, linting, a Docker image, `docker compose up` for local work, CI on GitHub Actions, and deploy workflows for staging (from `main`) and production (on a release tag) on Cloud Run, plus a runbook.

**Architecture:**
- A single Next.js app (App Router, `output: 'standalone'`) serves the storefront now and `/admin` later (ADR 0004).
- All deployment settings are read once, through `@argiva/config`, a Zod schema over environment variables (ADR 0012). The server exits at start-up if any value is invalid. Only `packages/config` may touch `process.env`; a lint rule enforces this.
- The root layout reads the theme on the server and sets `<html data-theme>`. That removes the theme flash found in Phase 1 Task 14.
- The same Docker image runs locally (compose), on staging and on production. Production promotes the exact image that staging built, so nothing is rebuilt at release.
- Turborepo runs `build`, `test` and `typecheck` across packages in dependency order. ESLint runs once from the root.

**Tech stack:**
- Next.js 16 and React 19.
- TypeScript 6.0 (see Task 1 for why it is not 7).
- Turborepo 2, ESLint 9 (flat config), typescript-eslint 8 and `eslint-config-next`.
- Zod 4 and Vitest 5.
- `postgres` (porsager) as the database driver; Drizzle wraps it in Phase 3.
- Docker with `node:22-alpine`, and Postgres 17 in compose.
- GitHub Actions, Google Cloud Run, Artifact Registry and Workload Identity Federation.

## Global constraints

- Package manager: always write `npx --loglevel=error pnpm@12.16.1 ...` inline (Corepack cannot fetch pnpm through the mirror; a shell variable holding the command does not work in zsh). Below, `pnpm` means exactly that. In zsh, quote `'@argiva/x@workspace:*'`.
- Node `>=22`. Workspaces: `apps/*` and `packages/*`.
- **Never `git commit` or `git push`.** Never ask for or store secrets. Commit only `.env.example`; it holds safe local values.
- No hard-coded domains, URLs, emails, phone numbers or prices in `apps/*/src` or `packages/*/src` (ADR 0012; enforced in Task 2). The only copy allowed is copy from `docs/brand-content.md`, used verbatim.
- No hex colours in `apps/web/src`, `packages/ui/src` or `apps/ui-preview/src`. Read colours only from `--argiva-*` variables.
- Do not change the behaviour of Phase 0 and Phase 1 code (`packages/design-tokens`, `packages/ui`, `apps/ui-preview`). The only allowed edits are the `typescript` version bump in Task 1 and the `tsconfig` fixes it needs. If existing code fails a new lint rule, add a scoped override in `eslint.config.mjs` and list it in the ledger; do not edit the code.
- Accessibility target: WCAG 2.2 AA. Region: `asia-south1`. Budget alert: ₹500.
- Free tiers only, and scale to zero (ADR 0003). Do not add Redis or any other paid service.

## File structure

```
turbo.json                         task graph (build, test, typecheck, dev)
eslint.config.mjs                  one flat config for the whole repo
.env.example                       every variable, safe local values, comments
.dockerignore
Dockerfile                         multi-stage, non-root, standalone Next.js
docker-compose.yml                 db (Postgres 17) + web, uploads volume
scripts/check-hardcoded.mjs        lint: domains, URLs, emails, phones, prices
scripts/check-hardcoded.test.mjs
scripts/smoke.mjs                  HTTP smoke test for a running app
packages/config/
  package.json, tsconfig.json, vitest.config.ts
  src/index.ts                     exports
  src/schema.ts                    envSchema (Zod)
  src/load.ts                      loadConfig(), getConfig(), ConfigError, AppConfig
  src/load.test.ts
apps/web/
  package.json, tsconfig.json, next.config.ts, vitest.config.ts
  public/.gitkeep
  src/instrumentation.ts           validates config at start-up; exits on error
  src/security-headers.ts          baseline security headers
  src/security-headers.test.ts
  src/server/health.ts             liveness(), readiness()
  src/server/health.test.ts
  src/server/db.ts                 getSql(), pingDatabase()
  src/app/theme-provider.tsx       'use client' re-export of ThemeProvider
  src/app/layout.tsx               <html data-theme> from config; robots per env
  src/app/page.tsx, page.module.css   holding page (brand name + tagline)
  src/app/api/health/route.ts      GET liveness
  src/app/api/ready/route.ts       GET readiness (database ping)
.github/workflows/ci.yml           lint, typecheck, test, build, container smoke
.github/workflows/deploy.yml       reusable: build/push image, deploy, smoke
.github/workflows/deploy-staging.yml      after CI succeeds on main
.github/workflows/deploy-production.yml   on tag v*.*.*
docs/runbook.md                    local dev, env reference, cloud setup, deploy, rollback
```

---

### Task 1: Toolchain, TypeScript 6 and Turborepo

**Why TypeScript 6:** TypeScript 7.0 (the Go rewrite) ships only the `tsc` binary. Its package's main export is just a version string, and it has no JavaScript API yet. Next.js type-checks through that API, and typescript-eslint requires `typescript >=4.8.4 <6.1.0`. TypeScript 6.0 is the last JavaScript-based release and is compatible with both. We move every workspace to `typescript@^6.0.3` and revisit 7 once Next.js and typescript-eslint support it.

**Files:**
- Modify: `package.json` (root): add devDependencies `turbo`, `typescript`; add scripts.
- Modify: `packages/ui/package.json`, `apps/ui-preview/package.json`: change `typescript` to `^6.0.3`.
- Create: `turbo.json`.
- Modify: `docs/decisions.md`: add a short "Tooling notes" section under the table.

**Interfaces:**
- Produces: these root scripts, used by CI and later tasks:
  - `build` → `turbo run build`
  - `test` → `turbo run test && node --test "scripts/*.test.mjs"`
  - `typecheck` → `turbo run typecheck`
  - `dev` → `turbo run dev --filter=@argiva/web`
- Each package exposes the scripts `build`, `test` and `typecheck` where they apply. Turbo skips packages that don't have the script.

- [ ] **Step 1: Record the baseline.** Run `pnpm ui:test` and `pnpm ui:typecheck`. Expected: 43 tests pass, and typecheck exits 0.
- [ ] **Step 2: Switch TypeScript.** Run:
  - `pnpm add -D -w typescript@^6.0.3 turbo@^2.11.10`
  - `pnpm --filter @argiva/ui add -D typescript@^6.0.3`
  - `pnpm --filter @argiva/ui-preview add -D typescript@^6.0.3`
- [ ] **Step 3: Re-run typecheck.** Run `pnpm ui:typecheck` and `pnpm --filter @argiva/ui-preview typecheck`.
  - TypeScript 6 defaults `types` to `[]`. If you see missing globals (for example `process` or `vite/client`), add an explicit `"types"` entry to that package's `tsconfig.json`. That is the only tsconfig change allowed.
  - Expected: both exit 0.
- [ ] **Step 4: Create `turbo.json`.**

```json
{
  "$schema": "./node_modules/turbo/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**", "!.next/cache/**"] },
    "typecheck": { "dependsOn": ["^build"] },
    "test": { "dependsOn": ["^build"] },
    "dev": { "dependsOn": ["^build"], "cache": false, "persistent": true }
  }
}
```

- [ ] **Step 5: Add the root scripts** from the Interfaces list. Keep every existing script.
- [ ] **Step 6: Verify.** Run `pnpm build`, `pnpm typecheck` and `pnpm test`.
  - Expected: design-tokens builds before ui; 43 ui tests and the 4 check-no-hex tests pass; exit code 0.
  - Run `pnpm build` a second time. Expected: `FULL TURBO` (cache hits).
- [ ] **Step 7: Record the decision.** Add a "Tooling notes" list under the table in `docs/decisions.md`: "TypeScript pinned to 6.0.x because Next.js and typescript-eslint need the TypeScript JavaScript API, which 7.0 lacks; revisit when both support 7."
- [ ] **Checkpoint:** add 1 to `phase2.tasksDone` and append "Task 1: complete" to the ledger.

### Task 2: Linting and the hard-coded-values check

**Files:**
- Create: `scripts/check-hardcoded.mjs`, `scripts/check-hardcoded.test.mjs`, `eslint.config.mjs`.
- Modify: root `package.json` (devDependencies and scripts).

**Interfaces:**
- Produces: `export function findHardcoded(text: string): Array<{ line: number; kind: 'url' | 'domain' | 'email' | 'phone' | 'price'; match: string }>`.
  - A line that contains `allow-hardcoded` is skipped. Use this escape with a reason, for example `// allow-hardcoded: XML namespace`.
- Produces these root scripts:
  - `lint` → `eslint . && pnpm lint:no-hex && pnpm lint:hardcoded`
  - `lint:no-hex` → existing roots plus `apps/web/src`
  - `lint:hardcoded` → `node scripts/check-hardcoded.mjs apps/web/src packages/ui/src packages/config/src`
- `apps/ui-preview` is excluded from `lint:hardcoded` because it is a demo tool with placeholder data. It stays in `lint:no-hex`.

- [ ] **Step 1: Write the failing tests** in `scripts/check-hardcoded.test.mjs`:

```js
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findHardcoded } from './check-hardcoded.mjs';

const kinds = (text) => findHardcoded(text).map((f) => f.kind);

test('flags absolute URLs and our own domain', () => {
  assert.deepEqual(kinds("const u = 'https://argivasilvers.com/shop';"), ['url', 'domain']);
  assert.deepEqual(kinds("fetch('https://api.example.org/x')"), ['url']);
});

test('allows localhost and the SVG namespace', () => {
  assert.deepEqual(kinds("const a = 'http://localhost:3000';"), []);
  assert.deepEqual(kinds('<svg xmlns="http://www.w3.org/2000/svg">'), []);
});

test('flags emails and Indian phone numbers', () => {
  assert.deepEqual(kinds("const e = 'hello@example.com';"), ['email']);
  assert.deepEqual(kinds("const p = '+91 98765 43210';"), ['phone']);
  assert.deepEqual(kinds('const p = 9876543210;'), ['phone']);
});

test('flags price literals', () => {
  assert.deepEqual(kinds('<span>₹1,299</span>'), ['price']);
  assert.deepEqual(kinds("const s = 'Rs. 500';"), ['price']);
  assert.deepEqual(kinds("const s = 'INR 500';"), ['price']);
});

test('ignores package imports, paise numbers and escaped lines', () => {
  assert.deepEqual(kinds("import { Button } from '@argiva/ui';"), []);
  assert.deepEqual(kinds('formatInr(129900)'), []);
  assert.deepEqual(kinds("const u = 'https://x.test'; // allow-hardcoded: test fixture"), []);
});

test('reports 1-based line numbers', () => {
  assert.equal(findHardcoded("a\nconst e = 'a@b.co';")[0].line, 2);
});
```

- [ ] **Step 2: Run the tests.** Run `node --test scripts/check-hardcoded.test.mjs`. Expected: FAIL (module not found).
- [ ] **Step 3: Implement `scripts/check-hardcoded.mjs`.** Use the same CLI shape as `check-no-hex.mjs`: walk the given roots, skip `node_modules`, `dist`, `.next`, `*.test.*` and `*.d.ts`, and scan `.ts`, `.tsx`, `.js` and `.mjs` files. Print `file:line: <kind> "<match>"; read it from @argiva/config or site settings`, and exit 1 on any finding.

```js
const RULES = [
  ['url', /\bhttps?:\/\/(?!localhost\b|127\.0\.0\.1\b|www\.w3\.org\/)[^\s'"`)<>]+/g],
  ['domain', /\bargivasilvers\.(?:com|in)\b/gi],
  ['email', /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g],
  ['phone', /(?<![\w.])(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}(?![\w.])/g],
  ['price', /(?:₹\s?\d|\bRs\.?\s?\d|\bINR\s?\d)/g],
];

export function findHardcoded(text) {
  const findings = [];
  text.split('\n').forEach((content, index) => {
    if (content.includes('allow-hardcoded')) return;
    for (const [kind, pattern] of RULES) {
      for (const m of content.matchAll(pattern)) findings.push({ line: index + 1, kind, match: m[0] });
    }
  });
  return findings;
}
```

- [ ] **Step 4: Run the tests again.** Run `node --test scripts/check-hardcoded.test.mjs`. Expected: 6 pass. Then run `pnpm lint:hardcoded`. Expected: exit 0. If it reports real findings in `packages/ui/src`, stop and report them; do not edit ui code.
- [ ] **Step 5: Install ESLint.**
  - Run `pnpm add -D -w eslint@^9 @eslint/js@^9 typescript-eslint@^8.72.1 eslint-config-next@16.4.3 eslint-plugin-jsx-a11y eslint-plugin-react-hooks globals`.
  - Why ESLint 9: `eslint-plugin-react`, which `eslint-config-next` uses, supports up to ESLint 9 only.
- [ ] **Step 6: Write `eslint.config.mjs`.** Check each plugin's README in `node_modules` for the exact flat-config export names. They differ between versions.

```js
import js from '@eslint/js';
import nextVitals from 'eslint-config-next/core-web-vitals';
import { defineConfig, globalIgnores } from 'eslint/config';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    '**/node_modules/**', '**/dist/**', '**/.next/**', '**/.turbo/**',
    '**/next-env.d.ts', 'sdd/**', '.github/skills/**',
  ]),
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  { languageOptions: { parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname } } },
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: globals.node },
  },
  { files: ['apps/web/**/*.{ts,tsx}'], extends: [nextVitals], settings: { next: { rootDir: 'apps/web' } } },
  {
    files: ['packages/ui/src/**/*.tsx', 'apps/ui-preview/src/**/*.tsx'],
    extends: [jsxA11y.flatConfigs.recommended, reactHooks.configs.flat.recommended],
  },
  {
    // ADR 0012: only @argiva/config reads the environment.
    files: ['apps/*/src/**/*.{ts,tsx}', 'packages/*/src/**/*.{ts,tsx}'],
    ignores: ['packages/config/**', 'apps/web/src/instrumentation.ts'],
    rules: {
      'no-restricted-properties': ['error', {
        object: 'process', property: 'env',
        message: 'Read settings through @argiva/config (ADR 0012).',
      }],
    },
  },
]);
```

- [ ] **Step 7: Run `pnpm exec eslint .`.**
  - TypeScript files outside every tsconfig (for example `vite.config.ts`) need `allowDefaultProject` in `parserOptions.projectService`, or need to be added to that package's tsconfig `include` (that is a tsconfig-only change).
  - If existing Phase 0 or Phase 1 code breaks a rule, add a scoped override (`files` plus the rule set to `off`, with a comment naming the file) and list it in the ledger. Do not edit the code.
  - Expected: exit 0.
- [ ] **Step 8: Run the whole lint.** Run `pnpm lint`. Expected: exit 0.
- [ ] **Checkpoint:** add 2 to `phase2.tasksDone` and append "Task 2: complete" plus any overrides to the ledger.

### Task 3: `packages/config`, typed config that fails fast

**Files:**
- Create: `packages/config/package.json`, `tsconfig.json`, `vitest.config.ts`, `src/index.ts`, `src/schema.ts`, `src/load.ts`, `src/load.test.ts`.
- Create: `.env.example` (root).

**Interfaces:**
- Consumes: `defaultThemeId`, `isThemeId` and `ThemeId` from `@argiva/design-tokens`.
- Produces (exported from `@argiva/config`):

```ts
export type AppEnv = 'local' | 'staging' | 'production';
export type StorageConfig =
  | { driver: 'local'; localDir: string }
  | { driver: 'r2'; accountId: string; bucket: string; accessKeyId: string; secretAccessKey: string };
export interface AppConfig {
  appEnv: AppEnv;
  baseUrl: string;
  version: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  databaseUrl: string;
  storage: StorageConfig;
  defaultThemeId: ThemeId;
}
export class ConfigError extends Error { readonly problems: string[] }
export function loadConfig(source?: Record<string, string | undefined>): AppConfig; // throws ConfigError
export function getConfig(): AppConfig; // loadConfig(process.env), cached
export const envSchema; // Zod schema
```

- [ ] **Step 1: Scaffold the package.**
  - `package.json`:
    - name `@argiva/config`, `private`, `"type": "module"`, `"exports": { ".": "./src/index.ts" }`;
    - scripts: `test` (`vitest run`) and `typecheck` (`tsc --noEmit`);
    - dependencies: `zod@^4.6.7` and `'@argiva/design-tokens@workspace:*'`;
    - devDependencies: `typescript@^6.0.3`, `vitest@^5.0.5` and `@types/node@^22`.
  - `tsconfig.json`: extends `../../tsconfig.base.json`, sets `"types": ["node"]`, includes `src` and `vitest.config.ts`.
  - `vitest.config.ts`: `defineConfig({ test: { environment: 'node' } })`.
- [ ] **Step 2: Write the failing tests** in `src/load.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { ConfigError, loadConfig } from './index';

const valid = {
  APP_ENV: 'local',
  APP_BASE_URL: 'http://localhost:3000',
  DATABASE_URL: 'postgres://argiva:secret-pw@localhost:5432/argiva',
  STORAGE_DRIVER: 'local',
  STORAGE_LOCAL_DIR: './.data/uploads',
};

function problemsOf(env: Record<string, string | undefined>): string[] {
  try {
    loadConfig(env);
  } catch (error) {
    if (error instanceof ConfigError) return error.problems;
    throw error;
  }
  throw new Error('expected ConfigError');
}

describe('loadConfig', () => {
  it('returns typed config with defaults', () => {
    expect(loadConfig(valid)).toEqual({
      appEnv: 'local',
      baseUrl: 'http://localhost:3000',
      version: 'dev',
      logLevel: 'info',
      databaseUrl: valid.DATABASE_URL,
      storage: { driver: 'local', localDir: './.data/uploads' },
      defaultThemeId: 'quiet-luxury',
    });
  });

  it('lists every problem at once, by variable name', () => {
    const problems = problemsOf({});
    for (const name of ['APP_ENV', 'APP_BASE_URL', 'DATABASE_URL', 'STORAGE_DRIVER']) {
      expect(problems.some((p) => p.startsWith(`${name}:`))).toBe(true);
    }
  });

  it('treats empty strings as missing', () => {
    expect(problemsOf({ ...valid, DATABASE_URL: '  ' }).some((p) => p.startsWith('DATABASE_URL:'))).toBe(true);
  });

  it('rejects a non-postgres database URL', () => {
    expect(problemsOf({ ...valid, DATABASE_URL: 'mysql://x@y/z' })).toEqual([
      'DATABASE_URL: must start with postgres:// or postgresql://',
    ]);
  });

  it('requires https outside local', () => {
    expect(problemsOf({ ...valid, APP_ENV: 'staging' })).toEqual(['APP_BASE_URL: must use https outside local']);
  });

  it('requires the local directory for local storage', () => {
    expect(problemsOf({ ...valid, STORAGE_LOCAL_DIR: undefined })).toEqual([
      'STORAGE_LOCAL_DIR: required when STORAGE_DRIVER=local',
    ]);
  });

  it('requires all R2 settings for r2 storage', () => {
    const problems = problemsOf({ ...valid, STORAGE_DRIVER: 'r2' });
    expect(problems).toEqual([
      'R2_ACCOUNT_ID: required when STORAGE_DRIVER=r2',
      'R2_BUCKET: required when STORAGE_DRIVER=r2',
      'R2_ACCESS_KEY_ID: required when STORAGE_DRIVER=r2',
      'R2_SECRET_ACCESS_KEY: required when STORAGE_DRIVER=r2',
    ]);
  });

  it('rejects an unknown theme id', () => {
    expect(problemsOf({ ...valid, DEFAULT_THEME_ID: 'neon-pink' })).toEqual([
      'DEFAULT_THEME_ID: must be a registered theme id',
    ]);
  });

  it('never puts secret values in the error message', () => {
    try {
      loadConfig({ ...valid, APP_ENV: 'nope' });
    } catch (error) {
      expect(String(error)).not.toContain('secret-pw');
      return;
    }
    throw new Error('expected ConfigError');
  });
});
```

- [ ] **Step 3: Run the tests.** Run `pnpm --filter @argiva/config test`. Expected: FAIL (cannot resolve `./index`).
- [ ] **Step 4: Implement `src/schema.ts`.**

```ts
import { defaultThemeId, isThemeId, type ThemeId } from '@argiva/design-tokens';
import { z } from 'zod';

const R2_KEYS = ['R2_ACCOUNT_ID', 'R2_BUCKET', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'] as const;
const optionalText = z.string().min(1).optional();

export const envSchema = z
  .object({
    APP_ENV: z.enum(['local', 'staging', 'production']),
    APP_BASE_URL: z.url(),
    APP_VERSION: z.string().min(1).default('dev'),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    DATABASE_URL: z.string().regex(/^postgres(?:ql)?:\/\/.+/, 'must start with postgres:// or postgresql://'),
    STORAGE_DRIVER: z.enum(['local', 'r2']),
    STORAGE_LOCAL_DIR: optionalText,
    R2_ACCOUNT_ID: optionalText,
    R2_BUCKET: optionalText,
    R2_ACCESS_KEY_ID: optionalText,
    R2_SECRET_ACCESS_KEY: optionalText,
    DEFAULT_THEME_ID: z
      .custom<ThemeId>((v) => typeof v === 'string' && isThemeId(v), { message: 'must be a registered theme id' })
      .default(defaultThemeId),
  })
  .superRefine((env, ctx) => {
    if (env.APP_ENV !== 'local' && !env.APP_BASE_URL.startsWith('https://')) {
      ctx.addIssue({ code: 'custom', path: ['APP_BASE_URL'], message: 'must use https outside local' });
    }
    if (env.STORAGE_DRIVER === 'local' && !env.STORAGE_LOCAL_DIR) {
      ctx.addIssue({ code: 'custom', path: ['STORAGE_LOCAL_DIR'], message: 'required when STORAGE_DRIVER=local' });
    }
    if (env.STORAGE_DRIVER === 'r2') {
      for (const key of R2_KEYS) {
        if (!env[key]) ctx.addIssue({ code: 'custom', path: [key], message: 'required when STORAGE_DRIVER=r2' });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;
```

  Note: in Zod 4, `superRefine` runs only when the object's own checks pass. That is why each `superRefine` test above changes only one field.

- [ ] **Step 5: Implement `src/load.ts`.**

```ts
import { envSchema, type Env } from './schema';
import type { ThemeId } from '@argiva/design-tokens';

export type AppEnv = Env['APP_ENV'];
export type StorageConfig =
  | { driver: 'local'; localDir: string }
  | { driver: 'r2'; accountId: string; bucket: string; accessKeyId: string; secretAccessKey: string };
export interface AppConfig {
  appEnv: AppEnv;
  baseUrl: string;
  version: string;
  logLevel: Env['LOG_LEVEL'];
  databaseUrl: string;
  storage: StorageConfig;
  defaultThemeId: ThemeId;
}

export class ConfigError extends Error {
  readonly problems: string[];
  constructor(problems: string[]) {
    super(`Invalid configuration:\n${problems.map((p) => `  - ${p}`).join('\n')}`);
    this.name = 'ConfigError';
    this.problems = problems;
  }
}

function storageFrom(env: Env): StorageConfig {
  if (env.STORAGE_DRIVER === 'local') return { driver: 'local', localDir: env.STORAGE_LOCAL_DIR! };
  return {
    driver: 'r2',
    accountId: env.R2_ACCOUNT_ID!,
    bucket: env.R2_BUCKET!,
    accessKeyId: env.R2_ACCESS_KEY_ID!,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
  };
}

export function loadConfig(source: Record<string, string | undefined> = process.env): AppConfig {
  const present = Object.fromEntries(Object.entries(source).filter(([, v]) => v !== undefined && v.trim() !== ''));
  const result = envSchema.safeParse(present);
  if (!result.success) {
    throw new ConfigError(result.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`));
  }
  const env = result.data;
  return {
    appEnv: env.APP_ENV,
    baseUrl: env.APP_BASE_URL,
    version: env.APP_VERSION,
    logLevel: env.LOG_LEVEL,
    databaseUrl: env.DATABASE_URL,
    storage: storageFrom(env),
    defaultThemeId: env.DEFAULT_THEME_ID,
  };
}

let cached: AppConfig | undefined;
export function getConfig(): AppConfig {
  return (cached ??= loadConfig());
}
```

  `src/index.ts`:

```ts
export { envSchema } from './schema';
export { ConfigError, getConfig, loadConfig, type AppConfig, type AppEnv, type StorageConfig } from './load';
```

- [ ] **Step 6: Run the tests again.** Run `pnpm --filter @argiva/config test` and `pnpm --filter @argiva/config typecheck`. Expected: 9 pass, and typecheck exits 0. Adjust messages only if Zod's built-in wording differs in a test that does not assert it.
- [ ] **Step 7: Write `.env.example`** (root). Comment every variable. Use safe local values only:

```dotenv
# Copy to .env for `pnpm dev`. Never commit .env. Read only through @argiva/config (ADR 0012).
# local | staging | production
APP_ENV=local
# Public base URL of the site (https required outside local)
APP_BASE_URL=http://localhost:3000
# Optional; set to the git SHA by the Docker build
# APP_VERSION=dev
# debug | info | warn | error
LOG_LEVEL=info
# Local Postgres from docker-compose.yml (local-only password)
DATABASE_URL=postgres://argiva:argiva_local_only@localhost:5432/argiva
# local | r2
STORAGE_DRIVER=local
STORAGE_LOCAL_DIR=./.data/uploads
# Required when STORAGE_DRIVER=r2 (set in the cloud, never here)
# R2_ACCOUNT_ID=
# R2_BUCKET=
# R2_ACCESS_KEY_ID=
# R2_SECRET_ACCESS_KEY=
# Fallback theme until the admin Appearance setting exists (Phase 6): quiet-luxury | warm-craft | modern-bold
DEFAULT_THEME_ID=quiet-luxury
```

  Add `.data/` to `.gitignore`.

- [ ] **Step 8: Verify.** Run `pnpm lint` and `pnpm test`. Expected: exit 0.
- [ ] **Checkpoint:** add 3 to `phase2.tasksDone` and append "Task 3: complete" to the ledger.

### Task 4: `apps/web`, the Next.js app with server-set theme and security headers

**Files:**
- Create: `apps/web/package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `public/.gitkeep`.
- Create: `src/security-headers.ts` and `src/security-headers.test.ts`.
- Create: `src/instrumentation.ts`.
- Create: `src/app/theme-provider.tsx`, `src/app/layout.tsx`, `src/app/page.tsx` and `src/app/page.module.css`.
- Modify: root `package.json` (`lint:no-hex` already includes `apps/web/src` from Task 2).

**Interfaces:**
- Consumes: `getConfig` and `ConfigError` from `@argiva/config`; `ThemeProvider` from `@argiva/ui`; and `@argiva/ui/fonts` and `@argiva/ui/global.css`.
- Produces: `export const securityHeaders: { key: string; value: string }[]`. The app listens on `PORT` (default 3000 in dev, 8080 in the container).

- [ ] **Step 1: Scaffold the package.**
  - `package.json`:
    - name `@argiva/web`, `private`, `"type": "module"`;
    - scripts: `dev` (`next dev --port 3000`), `build` (`next build`), `start` (`next start`), `test` (`vitest run`), `typecheck` (`next typegen && tsc --noEmit`);
    - dependencies: `next@16.4.3`, `react@^19.3.1`, `react-dom@^19.3.1`, `postgres@^3.4.0`, `'@argiva/config@workspace:*'`, `'@argiva/ui@workspace:*'` and `'@argiva/design-tokens@workspace:*'`;
    - devDependencies: `typescript@^6.0.3`, `vitest@^5.0.5`, `@types/node@^22`, `@types/react@^19.3.0` and `@types/react-dom@^19.3.0`.
  - Check the latest `postgres` version with `npm view postgres version` (4.x if it is out) and pin to it.
  - `tsconfig.json`: extends `../../tsconfig.base.json`; adds `"lib": ["dom", "dom.iterable", "ES2022"]`, `"noEmit": true`, `"types": ["node"]` and `"plugins": [{ "name": "next" }]`; includes `next-env.d.ts`, `src`, `*.ts`, `.next/types/**/*.ts` and `.next/dev/types/**/*.ts`. Accept any edits `next build` makes to this file, and note them in the ledger.
  - `vitest.config.ts`: `defineConfig({ test: { environment: 'node', include: ['src/**/*.test.ts'] } })`.
- [ ] **Step 2: Write the failing test** `src/security-headers.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { securityHeaders } from './security-headers';

const get = (key: string) => securityHeaders.find((h) => h.key === key)?.value;

describe('securityHeaders', () => {
  it('blocks framing, sniffing and leaky referrers', () => {
    expect(get('Content-Security-Policy')).toContain("frame-ancestors 'none'");
    expect(get('Content-Security-Policy')).toContain("object-src 'none'");
    expect(get('X-Frame-Options')).toBe('DENY');
    expect(get('X-Content-Type-Options')).toBe('nosniff');
    expect(get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
  });
  it('enforces HTTPS and denies powerful features', () => {
    expect(get('Strict-Transport-Security')).toMatch(/^max-age=\d{8,}; includeSubDomains$/);
    expect(get('Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=()');
  });
});
```

- [ ] **Step 3: Run the test.** Run `pnpm --filter @argiva/web test`. Expected: FAIL.
- [ ] **Step 4: Implement `src/security-headers.ts`.** The full nonce-based `script-src` CSP comes in Phase 8 (hardening); Razorpay's domains are added in Phase 5.

```ts
export const securityHeaders: { key: string; value: string }[] = [
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];
```

- [ ] **Step 5: Write `next.config.ts`.**

```ts
import path from 'node:path';
import type { NextConfig } from 'next';
import { securityHeaders } from './src/security-headers';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Trace files from the monorepo root so workspace packages land in the standalone output.
  // next build always runs with apps/web as the working directory.
  outputFileTracingRoot: path.resolve(process.cwd(), '../..'),
  transpilePackages: ['@argiva/ui', '@argiva/config'],
  poweredByHeader: false,
  headers: async () => [{ source: '/:path*', headers: securityHeaders }],
};

export default nextConfig;
```

- [ ] **Step 6: Write the app files.**

  `src/app/theme-provider.tsx`. `@argiva/ui` has no `'use client'` directives, and Phase 1 code stays unchanged. This client boundary lets the server layout use `ThemeProvider` (which uses React context). Phase 4 decides how the storefront composes the other ui components; record that as an open note.

```tsx
'use client';
export { ThemeProvider } from '@argiva/ui';
```

  `src/app/layout.tsx`. `connection()` makes the layout render per request, so it reads the config at run time and not at build time. The same image then serves every environment.

```tsx
import '@argiva/ui/fonts';
import '@argiva/ui/global.css';
import { getConfig } from '@argiva/config';
import type { Metadata } from 'next';
import { connection } from 'next/server';
import type { ReactNode } from 'react';
import { ThemeProvider } from './theme-provider';

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const isProduction = getConfig().appEnv === 'production';
  return {
    title: 'ARGIVA Silvers',
    description: 'Modern Silver. Timeless Stories.',
    robots: { index: isProduction, follow: isProduction },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  await connection();
  const { defaultThemeId } = getConfig();
  return (
    <html lang="en-IN" data-theme={defaultThemeId}>
      <body>
        <ThemeProvider themeId={defaultThemeId}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

  `src/app/page.tsx`. The copy is the brand name and the tagline, verbatim from `docs/brand-content.md`. The real home page comes in Phase 4.

```tsx
import styles from './page.module.css';

export default function HomePage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>ARGIVA Silvers</h1>
      <p className={styles.tagline}>Modern Silver. Timeless Stories.</p>
    </main>
  );
}
```

  `src/app/page.module.css`: centre the content in the viewport with a grid (`min-block-size: 100dvh; display: grid; place-content: center; text-align: center`). Use only `--argiva-*` variables that exist in `packages/design-tokens/dist/css/argiva.css` (grep for the space, font-family and size names). Use no hex values and no shadows.

  `src/instrumentation.ts`. This is the fail-fast rule: an invalid config stops the server before it serves anything.

```ts
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { ConfigError, getConfig } = await import('@argiva/config');
  try {
    getConfig();
  } catch (error) {
    if (error instanceof ConfigError) {
      console.error(error.message);
      process.exit(1);
    }
    throw error;
  }
}
```

- [ ] **Step 7: Run the tests and build.** Run `pnpm --filter @argiva/web test` (expected: 2 pass), `pnpm build` (expected: exit 0, and `apps/web/.next/standalone/apps/web/server.js` exists), then `pnpm typecheck` and `pnpm lint` (expected: exit 0).
- [ ] **Step 8: Check the app by hand.**
  - Run `cp .env.example apps/web/.env.local`, then `pnpm --filter @argiva/web dev` (async).
  - `curl -s localhost:3000 | grep -o 'data-theme="[a-z-]*"'`. Expected: `data-theme="quiet-luxury"`.
  - Check the page has `noindex` in a robots meta tag, and `curl -sI localhost:3000` shows the six headers.
  - Then set `DEFAULT_THEME_ID=warm-craft` in `.env.local`, restart, and expect `data-theme="warm-craft"`.
  - Then set `APP_ENV=bogus`. Expected: the server prints `Invalid configuration:` with `APP_ENV: ...` and exits.
  - Restore `.env.local` and stop the server. `.env.local` stays untracked because `.env.*` is ignored.
- [ ] **Checkpoint:** add 4 to `phase2.tasksDone` and append "Task 4: complete" to the ledger.

### Task 5: Health and readiness endpoints

**Files:**
- Create: `apps/web/src/server/health.ts` and `src/server/health.test.ts`.
- Create: `src/server/db.ts`, `src/app/api/health/route.ts` and `src/app/api/ready/route.ts`.

**Interfaces:**
- Produces:
  - `liveness(version: string): Response`
  - `readiness(ping: () => Promise<void>, timeoutMs?: number): Promise<Response>`
  - `getSql(): postgres.Sql`
  - `pingDatabase(): Promise<void>`
- Phase 3 builds Drizzle on top of `getSql()`.
- `GET /api/health`: 200 `{ status: 'ok', version }`. It never touches the database, so Cloud Run start-up is not tied to Neon waking up.
- `GET /api/ready`: 200 `{ status: 'ok', db: 'ok' }` or 503 `{ status: 'unavailable', db: 'down' }`.
- Both send `Cache-Control: no-store`.

- [ ] **Step 1: Write the failing tests** in `src/server/health.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { liveness, readiness } from './health';

describe('liveness', () => {
  it('reports ok with the version and is never cached', async () => {
    const res = liveness('abc123');
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(await res.json()).toEqual({ status: 'ok', version: 'abc123' });
  });
});

describe('readiness', () => {
  it('is ready when the database answers', async () => {
    const res = await readiness(async () => {});
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok', db: 'ok' });
  });

  it('is unavailable when the database fails, without leaking details', async () => {
    const res = await readiness(async () => {
      throw new Error('password authentication failed for user "argiva"');
    });
    expect(res.status).toBe(503);
    expect(res.headers.get('cache-control')).toBe('no-store');
    const body = await res.text();
    expect(body).toBe(JSON.stringify({ status: 'unavailable', db: 'down' }));
  });

  it('is unavailable when the database does not answer in time', async () => {
    const res = await readiness(() => new Promise<void>(() => {}), 10);
    expect(res.status).toBe(503);
  });
});
```

- [ ] **Step 2: Run the tests.** Run `pnpm --filter @argiva/web test`. Expected: FAIL.
- [ ] **Step 3: Implement `src/server/health.ts`.**

```ts
const noStore = { 'Cache-Control': 'no-store' };

export function liveness(version: string): Response {
  return Response.json({ status: 'ok', version }, { headers: noStore });
}

function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), ms);
  });
  return Promise.race([work, timeout]).finally(() => clearTimeout(timer));
}

export async function readiness(ping: () => Promise<void>, timeoutMs = 2000): Promise<Response> {
  try {
    await withTimeout(ping(), timeoutMs);
    return Response.json({ status: 'ok', db: 'ok' }, { headers: noStore });
  } catch (error) {
    console.error('readiness: database check failed', error instanceof Error ? error.name : 'unknown');
    return Response.json({ status: 'unavailable', db: 'down' }, { status: 503, headers: noStore });
  }
}
```

- [ ] **Step 4: Implement `src/server/db.ts` and the routes.**

```ts
// src/server/db.ts
import { getConfig } from '@argiva/config';
import postgres from 'postgres';

let sql: postgres.Sql | undefined;

export function getSql(): postgres.Sql {
  return (sql ??= postgres(getConfig().databaseUrl, { max: 5, idle_timeout: 20, connect_timeout: 5 }));
}

export async function pingDatabase(): Promise<void> {
  await getSql()`select 1`;
}
```

```ts
// src/app/api/health/route.ts
import { getConfig } from '@argiva/config';
import { liveness } from '../../../server/health';

export const dynamic = 'force-dynamic';

export function GET(): Response {
  return liveness(getConfig().version);
}
```

```ts
// src/app/api/ready/route.ts
import { pingDatabase } from '../../../server/db';
import { readiness } from '../../../server/health';

export const dynamic = 'force-dynamic';

export function GET(): Promise<Response> {
  return readiness(pingDatabase);
}
```

- [ ] **Step 5: Run the tests again.** Run `pnpm --filter @argiva/web test`. Expected: 6 pass. Then run `pnpm build`, `pnpm typecheck` and `pnpm lint`. Expected: exit 0.
- [ ] **Checkpoint:** add 5 to `phase2.tasksDone` and append "Task 5: complete" to the ledger.

### Task 6: Smoke script, Dockerfile and docker-compose

Docker Desktop must be running. If `docker info` fails, start it with `open -a Docker` and wait until `docker info` succeeds.

**Files:**
- Create: `scripts/smoke.mjs`, `Dockerfile`, `.dockerignore`, `docker-compose.yml`.

**Interfaces:**
- Produces: `node scripts/smoke.mjs <baseUrl> [--noindex]`, which exits 0 only if every check passes. Each check retries 5 times, 2 s apart, to cover cold starts and Neon waking up. Tasks 7 and 8 use it.

- [ ] **Step 1: Write `scripts/smoke.mjs`.**

```js
#!/usr/bin/env node
const [base, flag] = process.argv.slice(2);
if (!base) {
  console.error('usage: node scripts/smoke.mjs <baseUrl> [--noindex]');
  process.exit(2);
}
const url = (path) => new URL(path, base).toString();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function check(name, fn) {
  let lastError;
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      await fn();
      console.log(`ok   ${name}`);
      return true;
    } catch (error) {
      lastError = error;
      await sleep(2000);
    }
  }
  console.error(`FAIL ${name}: ${lastError?.message}`);
  return false;
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

const results = [
  await check('GET /api/health', async () => {
    const res = await fetch(url('/api/health'));
    expect(res.status === 200, `status ${res.status}`);
    expect((await res.json()).status === 'ok', 'status not ok');
  }),
  await check('GET /api/ready', async () => {
    const res = await fetch(url('/api/ready'));
    expect(res.status === 200, `status ${res.status}`);
    expect((await res.json()).db === 'ok', 'db not ok');
  }),
  await check('GET / (theme, heading, headers)', async () => {
    const res = await fetch(url('/'));
    expect(res.status === 200, `status ${res.status}`);
    const html = await res.text();
    expect(/<html[^>]*data-theme="[a-z-]+"/.test(html), 'no server-set data-theme');
    expect(html.includes('<h1'), 'no h1');
    expect((res.headers.get('content-security-policy') ?? '').includes("frame-ancestors 'none'"), 'CSP missing');
    expect(res.headers.get('x-content-type-options') === 'nosniff', 'nosniff missing');
    if (flag === '--noindex') expect(/<meta name="robots" content="noindex/.test(html), 'robots noindex missing');
  }),
];
process.exit(results.every(Boolean) ? 0 : 1);
```

- [ ] **Step 2: Watch it fail.** Run `node scripts/smoke.mjs http://127.0.0.1:3000`. Expected: FAIL on all three checks (nothing is running yet).
- [ ] **Step 3: Write `.dockerignore`.**

```
**/node_modules
**/.next
**/dist
**/.turbo
**/.env
**/.env.*
!.env.example
.git
.data
sdd
docs
```

- [ ] **Step 4: Write the `Dockerfile`.** The registry build argument lets a network that blocks the public npm registry pass in its mirror. Credentials are never baked into the image.

```dockerfile
# syntax=docker/dockerfile:1
ARG NODE_IMAGE=node:22-alpine

FROM ${NODE_IMAGE} AS build
ARG NPM_CONFIG_REGISTRY=https://registry.npmjs.org/
ENV NPM_CONFIG_REGISTRY=${NPM_CONFIG_REGISTRY} CI=true NEXT_TELEMETRY_DISABLED=1
RUN npm install -g pnpm@12.16.1 --loglevel=error
WORKDIR /repo
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch
COPY . .
RUN pnpm install --offline --frozen-lockfile
RUN pnpm turbo run build --filter=@argiva/web...

FROM ${NODE_IMAGE} AS runner
ARG APP_VERSION=dev
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=8080 HOSTNAME=0.0.0.0 APP_VERSION=${APP_VERSION}
WORKDIR /app
RUN addgroup -S argiva && adduser -S argiva -G argiva \
  && mkdir -p /data/uploads && chown argiva:argiva /data/uploads
COPY --from=build --chown=argiva:argiva /repo/apps/web/.next/standalone ./
COPY --from=build --chown=argiva:argiva /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=argiva:argiva /repo/apps/web/public ./apps/web/public
USER argiva
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/api/health" || exit 1
CMD ["node", "apps/web/server.js"]
```

  If `pnpm install` warns about ignored build scripts that the build needs, add only those packages to `onlyBuiltDependencies` in `pnpm-workspace.yaml`, and record them in the ledger.

- [ ] **Step 5: Write `docker-compose.yml`.** The password is for local use only. It is documented as such and never used in the cloud.

```yaml
name: argiva
services:
  db:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: argiva
      POSTGRES_PASSWORD: argiva_local_only
      POSTGRES_DB: argiva
    ports: ['127.0.0.1:5432:5432']
    volumes: ['db-data:/var/lib/postgresql/data']
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U argiva -d argiva']
      interval: 5s
      timeout: 3s
      retries: 10
  web:
    build:
      context: .
      args:
        APP_VERSION: local
    depends_on:
      db: { condition: service_healthy }
    environment:
      APP_ENV: local
      APP_BASE_URL: http://localhost:3000
      DATABASE_URL: postgres://argiva:argiva_local_only@db:5432/argiva
      STORAGE_DRIVER: local
      STORAGE_LOCAL_DIR: /data/uploads
      DEFAULT_THEME_ID: quiet-luxury
    ports: ['127.0.0.1:3000:8080']
    volumes: ['uploads:/data/uploads']
volumes:
  db-data:
  uploads:
```

- [ ] **Step 6: Build and run.** Run `docker compose up -d --build --wait`. Expected: both services report healthy. If the build cannot reach the npm registry, retry with `docker compose build --build-arg NPM_CONFIG_REGISTRY=$(npm config get registry)`, and document that in the runbook.
- [ ] **Step 7: Run the smoke test.** Run `node scripts/smoke.mjs http://127.0.0.1:3000 --noindex`. Expected: 3 `ok` lines, exit 0.
- [ ] **Step 8: Check fail-fast and non-root.**
  - `docker compose run --rm -e APP_ENV=bogus web`. Expected: prints `Invalid configuration:` / `APP_ENV: ...` and exits non-zero.
  - `docker compose exec web id -u`. Expected: not `0`.
  - `docker compose stop db`, then `curl -s -o /dev/null -w '%{http_code}' 127.0.0.1:3000/api/ready`. Expected: `503`.
  - Then `docker compose start db`.
- [ ] **Step 9: Record the image size** (`docker image ls argiva-web`) in the ledger. Leave the stack running or stop it with `docker compose down`, and keep the volumes.
- [ ] **Checkpoint:** add 6 to `phase2.tasksDone` and append "Task 6: complete" to the ledger.

### Task 7: CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`. Keep `design-tokens.yml` unchanged.

- [ ] **Step 1: Write `ci.yml`.**

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]
permissions:
  contents: read
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
  container:
    needs: verify
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: docker compose up -d --build --wait
      - run: node scripts/smoke.mjs http://127.0.0.1:3000 --noindex
      - if: failure()
        run: docker compose logs
      - if: always()
        run: docker compose down -v
```

  `pnpm build` runs before `lint` so that the design-tokens `dist` exists for type-aware lint. `pnpm/action-setup@v4` reads the version from `packageManager` in the root `package.json`.

- [ ] **Step 2: Validate it.** Run `docker run --rm -v "$PWD:/repo" -w /repo rhysd/actionlint:latest -color`. Expected: no findings. Also run the same commands as the `verify` job locally, in order. Expected: exit 0.
- [ ] **Checkpoint:** add 7 to `phase2.tasksDone` and append "Task 7: complete" to the ledger.

### Task 8: Deploy workflows (staging from `main`, production on tag)

**How it works:**
- Staging builds the image once, tagged with the commit SHA, pushes it to Artifact Registry and deploys it.
- Production deploys the same image when a tag `vX.Y.Z` is pushed on a commit that staging already deployed. Nothing is rebuilt.
- GitHub signs in to Google Cloud with Workload Identity Federation, a short-lived token with no stored key.
- Both workflows skip until the owner sets the repository variable `GCP_PROJECT_ID` (see the runbook). So they are safe to merge before the cloud accounts exist.

**Files:**
- Create: `.github/workflows/deploy.yml` (reusable), `deploy-staging.yml` and `deploy-production.yml`.

**Interfaces:**
- Repository variables (shared): `GCP_PROJECT_ID`, `GCP_REGION` (`asia-south1`), `GCP_AR_REPOSITORY`, `GCP_WIF_PROVIDER`, `GCP_DEPLOY_SA`.
- Environment variables (one set per GitHub environment, `staging` and `production`): `CLOUD_RUN_SERVICE`, `GCP_RUNTIME_SA`, `APP_ENV`, `APP_BASE_URL`, `DATABASE_URL_SECRET` (the Secret Manager secret name), `CLOUD_RUN_MAX_INSTANCES`.
- No GitHub secrets are needed.

- [ ] **Step 1: Write `deploy.yml`.** Every `${{ }}` value goes through `env:` and is quoted in shell. That prevents script injection.

```yaml
name: Deploy (reusable)
on:
  workflow_call:
    inputs:
      environment: { type: string, required: true }
      sha: { type: string, required: true }
      build: { type: boolean, required: true }
permissions:
  contents: read
  id-token: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    env:
      REGION: ${{ vars.GCP_REGION }}
      IMAGE: ${{ vars.GCP_REGION }}-docker.pkg.dev/${{ vars.GCP_PROJECT_ID }}/${{ vars.GCP_AR_REPOSITORY }}/web:${{ inputs.sha }}
      SHA: ${{ inputs.sha }}
      SERVICE: ${{ vars.CLOUD_RUN_SERVICE }}
      RUNTIME_SA: ${{ vars.GCP_RUNTIME_SA }}
      APP_ENV: ${{ vars.APP_ENV }}
      APP_BASE_URL: ${{ vars.APP_BASE_URL }}
      DATABASE_URL_SECRET: ${{ vars.DATABASE_URL_SECRET }}
      MAX_INSTANCES: ${{ vars.CLOUD_RUN_MAX_INSTANCES }}
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ inputs.sha }}
      - uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ vars.GCP_WIF_PROVIDER }}
          service_account: ${{ vars.GCP_DEPLOY_SA }}
      - uses: google-github-actions/setup-gcloud@v2
      - name: Build and push image
        if: inputs.build
        run: |
          gcloud auth configure-docker "$REGION-docker.pkg.dev" --quiet
          docker build --build-arg APP_VERSION="$SHA" -t "$IMAGE" .
          docker push "$IMAGE"
      - name: Deploy to Cloud Run
        # STORAGE_DRIVER=local is temporary: nothing stores files until Phase 3/4, which switches to R2.
        run: |
          gcloud run deploy "$SERVICE" --image "$IMAGE" --region "$REGION" \
            --service-account "$RUNTIME_SA" --allow-unauthenticated --port 8080 \
            --cpu 1 --memory 512Mi --min-instances 0 --max-instances "$MAX_INSTANCES" --concurrency 80 \
            --set-env-vars "APP_ENV=$APP_ENV,APP_BASE_URL=$APP_BASE_URL,APP_VERSION=$SHA,STORAGE_DRIVER=local,STORAGE_LOCAL_DIR=/tmp/uploads" \
            --set-secrets "DATABASE_URL=$DATABASE_URL_SECRET:latest"
      - name: Smoke test
        run: |
          URL="$(gcloud run services describe "$SERVICE" --region "$REGION" --format='value(status.url)')"
          if [ "$APP_ENV" = "production" ]; then node scripts/smoke.mjs "$URL"; else node scripts/smoke.mjs "$URL" --noindex; fi
```

- [ ] **Step 2: Write `deploy-staging.yml`.** It runs only after CI succeeds on `main`. It uses the CI commit's SHA (`workflow_run.head_sha`), not the latest commit on `main`.

```yaml
name: Deploy staging
on:
  workflow_run:
    workflows: [CI]
    types: [completed]
    branches: [main]
permissions:
  contents: read
  id-token: write
concurrency:
  group: deploy-staging
  cancel-in-progress: false
jobs:
  deploy:
    if: github.event.workflow_run.conclusion == 'success' && vars.GCP_PROJECT_ID != ''
    uses: ./.github/workflows/deploy.yml
    with:
      environment: staging
      sha: ${{ github.event.workflow_run.head_sha }}
      build: true
```

- [ ] **Step 3: Write `deploy-production.yml`.**

```yaml
name: Deploy production
on:
  push:
    tags: ['v*.*.*']
permissions:
  contents: read
  id-token: write
concurrency:
  group: deploy-production
  cancel-in-progress: false
jobs:
  deploy:
    if: vars.GCP_PROJECT_ID != ''
    uses: ./.github/workflows/deploy.yml
    with:
      environment: production
      sha: ${{ github.sha }}
      build: false
```

- [ ] **Step 4: Validate.** Run actionlint again (same command as Task 7). Expected: no findings.
- [ ] **Checkpoint:** add 8 to `phase2.tasksDone` and append "Task 8: complete" to the ledger.

### Task 9: Runbook and README

**Files:**
- Create: `docs/runbook.md`.
- Modify: `README.md` (add a short "Develop locally" section that links to the runbook).

- [ ] **Step 1: Write `docs/runbook.md`** with these sections. Write in plain language, define jargon on first use, and give exact commands. Every value the owner chooses is written as `<PLACEHOLDER>`. No secrets.
  1. **Local development.**
     - Prerequisites: Node 22 and Docker Desktop.
     - Install with `npx --loglevel=error pnpm@12.16.1 install`.
     - Run the whole stack with `docker compose up -d --build --wait`, or run the database only with `docker compose up -d db` plus `cp .env.example apps/web/.env.local` and `pnpm dev`.
     - Run `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build`.
     - Smoke test: `node scripts/smoke.mjs http://127.0.0.1:3000 --noindex`.
     - If npm is mirrored, build with the `NPM_CONFIG_REGISTRY` build argument.
  2. **Configuration reference.** A table of every variable in `.env.example`: meaning, required or optional, example, and where it is set (local `.env.local`, compose, Cloud Run env var, or Secret Manager). It also states the fail-fast rule and the ADR 0012 lint rule.
  3. **One-time cloud setup (owner).** `gcloud` commands, in order:
     - create the project and link billing;
     - set a budget alert at ₹500 with thresholds of 50 %, 90 % and 100 % (`gcloud billing budgets create`);
     - enable the APIs `run`, `artifactregistry`, `iamcredentials`, `secretmanager` and `sts`;
     - create the Artifact Registry Docker repo in `asia-south1`, with a cleanup policy that keeps the last 10 images;
     - create two service accounts:
       - `argiva-deployer`, with `roles/run.admin`, `roles/artifactregistry.writer`, and `roles/iam.serviceAccountUser` on the runtime account only;
       - `argiva-runtime`, with `roles/secretmanager.secretAccessor` on its two secrets only;
     - set up Workload Identity Federation: a pool plus a GitHub OIDC provider with `attribute-condition="assertion.repository=='<OWNER>/<REPO>'"`, and `roles/iam.workloadIdentityUser` binding the repo to `argiva-deployer`;
     - create the Secret Manager secrets `argiva-staging-database-url` and `argiva-production-database-url`. The owner pastes the values; they are never typed into chat or the repo.
     - Explain `roles/run.admin`: it is needed so the workflow can keep the public (`--allow-unauthenticated`) setting. It is scoped to this project.
  4. **Neon setup (owner).**
     - Create a project in the region closest to Mumbai that Neon offers. Check Neon's current region list. If it has no India region, record the chosen region and flag it for the DPDP review; do not assume.
     - Create the `production` (main) branch and a `staging` branch.
     - Copy each pooled connection string with `sslmode=require` into its Secret Manager secret.
  5. **GitHub settings (owner).**
     - Add the repository variables and the `staging` and `production` environment variables (table from Task 8).
     - Give `production` a required reviewer (the owner) and allow only `v*.*.*` tags to deploy.
     - Protect `main`: require a pull request and the `CI / verify` and `CI / container` checks.
     - The workflows stay skipped until `GCP_PROJECT_ID` is set.
  6. **Deploying.**
     - Staging is automatic after CI passes on `main`.
     - Production: check staging, then `git tag vX.Y.Z <sha> && git push origin vX.Y.Z` (the owner runs this), then approve the environment in GitHub.
  7. **Rollback.**
     - List revisions: `gcloud run revisions list --service <SERVICE> --region asia-south1`.
     - Send traffic back to an earlier revision: `gcloud run services update-traffic <SERVICE> --region asia-south1 --to-revisions <REVISION>=100`.
     - Or re-run the production workflow for the previous tag.
  8. **Troubleshooting.**
     - Start-up exits with `Invalid configuration`: read the listed variables.
     - `/api/ready` returns 503: the database is unreachable or Neon is waking up; retry.
     - Cold starts take 1–3 s after idle.
     - Check the logs with `gcloud run services logs read <SERVICE> --region asia-south1`.
  9. **Costs.** What stays free (scale to zero, Neon free, Artifact Registry under 0.5 GB with the cleanup policy) and where the ₹500 alert goes.
- [ ] **Step 2: Check it against the code.** Every variable name in the runbook matches `.env.example`, `envSchema` and the workflows (grep each name). Every command uses the same names as Task 8.
- [ ] **Checkpoint:** add 9 to `phase2.tasksDone` and append "Task 9: complete" to the ledger.

### Task 10: Phase verification and owner hand-off

- [ ] **Step 1: Fresh-clone check.** In a temporary copy without build output (`rsync -a --exclude node_modules --exclude .next --exclude dist --exclude .turbo ./ /tmp/argiva-check/`), run install, `pnpm build`, `pnpm lint`, `pnpm typecheck` and `pnpm test`. Expected: all exit 0. Then delete the temporary copy.
- [ ] **Step 2: Compose check.** Run `docker compose down -v && docker compose up -d --build --wait && node scripts/smoke.mjs http://127.0.0.1:3000 --noindex`. Expected: exit 0.
- [ ] **Step 3: Browser check.**
  - Open `http://localhost:3000`. Run axe and expect 0 violations.
  - Check the theme switches without a flash: set `DEFAULT_THEME_ID`, restart, and confirm `<html data-theme>` is already set in the server HTML.
  - Take one screenshot to `sdd/design/phase-2/home-holding.png`.
- [ ] **Step 4: Update state.**
  - Set phase-2 to `awaiting-owner`.
  - Add to `awaitingOwner`, in plain language:
    1. Review the uncommitted changes, then commit and push them to `main`, so CI runs on GitHub.
    2. Create the Google Cloud account and project, with a card on file and the ₹500 budget alert (runbook §3).
    3. Create the Neon account and project (runbook §4).
    4. Set the GitHub variables, environments and branch protection (runbook §5).
  - Phase 2 is done when CI is green on GitHub and staging deploys from `main`.
- [ ] **Checkpoint:** add 10 to `phase2.tasksDone` and append the Phase 2 summary to the ledger.

### Task 11: Documentation backfill (added at the owner's request)

Every phase now ends with a documentation task (see "Rules for every phase" in [the roadmap](README.md)). This task brings Phases 0–2 up to that rule.

- [x] **Step 1: Setup guide.** Create `docs/setup.md` for the owner's one-time steps:
  - tools;
  - GitHub account and plan choice;
  - Google account and billing;
  - Neon account;
  - first push;
  - Google Cloud, Neon and GitHub settings, moved from runbook sections 3–5, which now point to it;
  - first deploy check.
  
  Link it from the README.
- [x] **Step 2: Rule.** Add the documentation rule to the scaffold prompt, `AGENTS.md`, `sdd/state.json` rules and this roadmap.
- [x] **Step 3: Docs index.** Create `docs/README.md` listing every document: setup, runbook, ADRs, decisions, plans, brand content, imagery, PRODUCT.md, DESIGN.md, and the package READMEs.
- [x] **Step 4: Package READMEs.** Add a `README.md` to `apps/web`, `apps/ui-preview`, `packages/ui` and `packages/config`. Each covers:
  - purpose;
  - what it exports or serves;
  - how to run, build and test it, with exact commands;
  - how it fits with the other packages;
  - rules, such as "only `@argiva/config` reads `process.env`" and "UI uses only `--argiva-*` variables".
  
  Facts come from the code, not guesses.
- [x] **Step 5: Check links.** Every relative link in `*.md` (excluding `node_modules`) resolves to an existing file. `pnpm lint` still exits 0.
- [x] **Checkpoint:** add 11 to `phase2.tasksDone` and append "Task 11: complete" to the ledger.

## Out of scope (later phases)

- Drizzle schema and migrations (Phase 3).
- R2 storage adapter (Phase 3/4).
- Playwright end-to-end tests with axe (Phase 4, once real pages exist).
- Full nonce-based CSP, action SHA pinning, rate limiting and backups (Phase 8).
- Loading only the active theme's fonts: browsers download only the font files that rendered text uses, so the cost now is CSS size only (Phase 6).
- Terraform (later, per ADR 0003).
