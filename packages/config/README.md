# @argiva/config

The one place where ARGIVA reads its settings. It reads environment variables, checks them all at once, and hands the rest of the code a typed settings object. If anything is missing or wrong, it stops with a clear list of what to fix. This follows [ADR 0012](../../docs/adr/0012-config-driven.md): business values and environment settings live in configuration, not in code.

**Only this package may read `process.env`.** ESLint fails anywhere else under `apps/*/src` or `packages/*/src`. The one exception is `apps/web/src/instrumentation.ts`, which checks which Next.js runtime it is in.

## Settings

Every setting is listed with an example in the root `.env.example`. Empty or blank values count as missing.

| Variable | Required | Allowed values | Default |
| --- | --- | --- | --- |
| `APP_ENV` | Yes | `local`, `staging`, `production` | |
| `APP_BASE_URL` | Yes | A URL. Must start with `https://` unless `APP_ENV=local`. | |
| `APP_VERSION` | No | Any text. The Docker build sets it. | `dev` |
| `LOG_LEVEL` | No | `debug`, `info`, `warn`, `error` | `info` |
| `DATABASE_URL` | Yes | Starts with `postgres://` or `postgresql://` | |
| `STORAGE_DRIVER` | Yes | `local`, `r2` | |
| `STORAGE_LOCAL_DIR` | When `STORAGE_DRIVER=local` | A folder path | |
| `R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | All four when `STORAGE_DRIVER=r2` | Text | |
| `DEFAULT_THEME_ID` | No | A theme id registered in `@argiva/design-tokens` | The registry's default theme |

For what each setting means in each environment, see the [runbook's configuration reference](../../docs/runbook.md#2-configuration-reference).

## API

```ts
import { getConfig, ConfigError } from '@argiva/config';

const { appEnv, baseUrl, databaseUrl, storage, defaultThemeId } = getConfig();
```

| Export | What it does |
| --- | --- |
| `getConfig()` | Reads `process.env` on the first call, checks it, and caches the result. Later calls return the same object. Use this in app code. |
| `loadConfig(source?)` | Same check without the cache. Takes any key/value object (default `process.env`). Useful in tests. |
| `ConfigError` | Thrown when settings are invalid. `problems` is a list such as `DATABASE_URL: must start with postgres:// or postgresql://`. The message lists every problem, one per line. |
| `envSchema` | The zod schema behind the check. |
| `AppConfig`, `AppEnv`, `StorageConfig` | Types. |

`AppConfig` has `appEnv`, `baseUrl`, `version`, `logLevel`, `databaseUrl`, `storage` and `defaultThemeId`. `storage` is either `{ driver: 'local', localDir }` or `{ driver: 'r2', accountId, bucket, accessKeyId, secretAccessKey }`.

### Fail fast

- All problems are reported together, by variable name, so you fix them in one go.
- Error messages name the variable and the rule, never the value. Passwords and keys don't end up in logs.
- `@argiva/web` calls `getConfig()` when the server starts. On a `ConfigError` it prints the problems and exits with code 1, so a misconfigured site never starts.

## Commands

Run from the repo root. We run pnpm through npx; the [runbook](../../docs/runbook.md#how-we-run-pnpm) explains why.

| What it does | Command |
| --- | --- |
| Run tests | `npx --loglevel=error pnpm@12.16.1 --filter @argiva/config test` |
| Type check | `npx --loglevel=error pnpm@12.16.1 --filter @argiva/config typecheck` |
| Lint (whole repo) | `npx --loglevel=error pnpm@12.16.1 lint` |

There is no build step. The package ships TypeScript source and apps compile it. The tests pass settings to `loadConfig()` directly, so they need no `.env` file or database.

## How it fits with other packages

- Depends on `@argiva/design-tokens` to check `DEFAULT_THEME_ID` against the theme registry, and on `zod` for the schema.
- Used by `@argiva/web`.

## Rules for contributors

- Write the test first in `src/load.test.ts`, then change the schema.
- To add a setting: add it to `src/schema.ts`, map it in `AppConfig` in `src/load.ts`, add it to the root `.env.example` and to the runbook's configuration reference.
- Never put a real secret in `.env.example`, a test or an error message.
- No hard-coded URLs, domains, emails, phone numbers or prices in `src/`. `lint:hardcoded` checks this; local addresses such as `localhost` are allowed.

## Related docs

- [ADR 0012: Configuration-driven, no hard-coded business values](../../docs/adr/0012-config-driven.md)
- [Runbook](../../docs/runbook.md)
- [Setup guide](../../docs/setup.md): where cloud settings and secrets are created
- [ADR 0003: Cloud hosting](../../docs/adr/0003-cloud-hosting.md)
