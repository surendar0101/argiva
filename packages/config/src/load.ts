import type { ThemeId } from '@argiva/design-tokens';
import { envSchema, type Env } from './schema';

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
