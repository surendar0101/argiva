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
