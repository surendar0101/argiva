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
