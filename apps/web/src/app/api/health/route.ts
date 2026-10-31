import { getConfig } from '@argiva/config';
import { liveness } from '../../../server/health';

export const dynamic = 'force-dynamic';

export function GET(): Response {
  return liveness(getConfig().version);
}
