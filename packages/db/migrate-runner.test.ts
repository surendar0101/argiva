import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const packageRoot = fileURLToPath(new URL('.', import.meta.url));

function runMigrationRunner(env: Record<string, string>) {
  const runner = fileURLToPath(new URL('./migrate-runner.ts', import.meta.url));
  const result = spawnSync(process.execPath, ['--import', 'tsx', runner], {
    cwd: packageRoot,
    encoding: 'utf8',
    timeout: 15_000,
    env: { PATH: process.env.PATH, ...env },
  });
  return { ...result, output: `${result.stdout ?? ''}\n${result.stderr ?? ''}` };
}

describe('database migration runner', () => {
  test('exposes a db:migrate package command', () => {
    const manifest = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
      scripts?: Record<string, string>;
    };

    expect(manifest.scripts?.['db:migrate']).toBe('tsx migrate-runner.ts');
  });

  test('stops when no database is named instead of falling back to one', () => {
    const result = runMigrationRunner({});

    expect(result.status).toBe(1);
    expect(result.output).toContain('DATABASE_URL is not set');
  }, 20_000);

  test('fails with the connection error when the database is unreachable', () => {
    const result = runMigrationRunner({ DATABASE_URL: 'postgres://test:test@127.0.0.1:1/argiva' });

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(1);
    expect(result.output).toContain('ECONNREFUSED');
  }, 20_000);
});
