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
    const res = await readiness(async () => { });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok', db: 'ok' });
  });

  it('is unavailable when the database fails, without leaking details', async () => {
    const res = await readiness(() =>
      Promise.reject(new Error('password authentication failed for user "argiva"')),
    );
    expect(res.status).toBe(503);
    expect(res.headers.get('cache-control')).toBe('no-store');
    const body = await res.text();
    expect(body).toBe(JSON.stringify({ status: 'unavailable', db: 'down' }));
  });

  it('is unavailable when the database does not answer in time', async () => {
    const res = await readiness(() => new Promise<void>(() => { }), 10);
    expect(res.status).toBe(503);
  });
});
