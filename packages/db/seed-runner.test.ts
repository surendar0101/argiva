import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const packageRoot = fileURLToPath(new URL('.', import.meta.url));

describe('database seed runner', () => {
  test('exposes a db:seed package command', () => {
    const manifest = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
      scripts?: Record<string, string>;
    };

    expect(manifest.scripts?.['db:seed']).toBe('tsx seed-runner.ts');
  });

  test('passes a configured database to the seed and closes the pool after a connection failure', () => {
    const runner = fileURLToPath(new URL('./seed-runner.ts', import.meta.url));
    const result = spawnSync(process.execPath, ['--import', 'tsx', runner], {
      cwd: packageRoot,
      encoding: 'utf8',
      timeout: 15_000,
      env: {
        PATH: process.env.PATH,
        APP_ENV: 'local',
        APP_BASE_URL: 'http://localhost:3000',
        DATABASE_URL: 'postgres://test:test@127.0.0.1:1/argiva',
        STORAGE_DRIVER: 'local',
        STORAGE_LOCAL_DIR: './.data/uploads',
        LOG_LEVEL: 'error',
      },
    });
    const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(1);
    expect(output).toContain('ECONNREFUSED');
    expect(output).not.toContain("Cannot read properties of undefined (reading 'insert')");
  }, 20_000);
});
