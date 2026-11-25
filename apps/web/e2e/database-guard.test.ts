// @vitest-environment node
import { describe, expect, test } from 'vitest';
import { assertTestDatabaseUrl } from './database-guard';

describe('assertTestDatabaseUrl', () => {
  test.each([
    'postgres://u:p@127.0.0.1:5432/argiva_e2e',
    'postgresql://u:p@localhost:55432/argiva_empty_e2e',
  ])('accepts the local test database %s', (url) => {
    expect(() => assertTestDatabaseUrl(url)).not.toThrow();
  });

  test.each([
    ['a remote host', 'postgres://u:p@db.example.com:5432/argiva_e2e'],
    ['the local development database', 'postgres://u:p@127.0.0.1:5432/argiva'],
    ['a connection option that redirects the host', 'postgres://u:p@127.0.0.1/argiva_e2e?host=db.example.com'],
    ['an unreadable address', 'not a url'],
  ])('refuses %s', (_label, url) => {
    expect(() => assertTestDatabaseUrl(url)).toThrow(/test database/i);
  });

  test('does not repeat the password in the refusal', () => {
    expect(() => assertTestDatabaseUrl('postgres://u:hunter2@db.example.com/argiva_e2e')).toThrow(
      expect.objectContaining({ message: expect.not.stringContaining('hunter2') as string }),
    );
  });
});
