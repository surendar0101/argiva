import { getConfig } from '@argiva/config';
import postgres from 'postgres';

let sql: postgres.Sql | undefined;

export function getSql(): postgres.Sql {
  return (sql ??= postgres(getConfig().databaseUrl, { max: 5, idle_timeout: 20, connect_timeout: 5 }));
}

export async function pingDatabase(): Promise<void> {
  await getSql()`select 1`;
}
