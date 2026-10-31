import { pingDatabase } from '../../../server/db';
import { readiness } from '../../../server/health';

export const dynamic = 'force-dynamic';

export function GET(): Promise<Response> {
  return readiness(pingDatabase);
}
