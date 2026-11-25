const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

/**
 * Throws unless the address is a database on this computer whose name ends in `_e2e`.
 * The browser tests drop and recreate their databases, so nothing else is allowed.
 */
export function assertTestDatabaseUrl(url: string): void {
  let parsed: URL | undefined;
  try {
    parsed = new URL(url);
  } catch {
    parsed = undefined;
  }

  const isSafe =
    parsed !== undefined &&
    /^postgres(?:ql)?:$/.test(parsed.protocol) &&
    LOCAL_HOSTS.has(parsed.hostname) &&
    // Query options such as ?host= can redirect the connection elsewhere.
    parsed.search === '' &&
    /^\/[a-z0-9_]+_e2e$/.test(parsed.pathname);

  if (!isSafe) {
    // The address is not echoed because it carries a password.
    throw new Error('Refusing to use this as a test database: it must be local and its name must end in _e2e');
  }
}
