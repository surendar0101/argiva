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
