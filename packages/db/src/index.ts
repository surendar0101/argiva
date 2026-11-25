import { getConfig } from '@argiva/config';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let client: postgres.Sql | undefined;
let db: PostgresJsDatabase<typeof schema> | undefined;

/**
 * Returns a Drizzle ORM database instance configured with `prepare: false`
 * for compatibility with Neon PgBouncer connection pooling in transaction mode.
 */
export function getDb(connectionString?: string): PostgresJsDatabase<typeof schema> {
  if (db && !connectionString) {
    return db;
  }

  const url = connectionString ?? getConfig().databaseUrl;
  const sql = postgres(url, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 5,
    prepare: false, // Essential for Neon / PgBouncer transaction pooling
  });

  if (!connectionString) {
    client = sql;
    db = drizzle(sql, { schema });
    return db;
  }

  return drizzle(sql, { schema });
}

export async function closeDb(): Promise<void> {
  if (client) {
    await client.end();
    client = undefined;
    db = undefined;
  }
}

export * from './schema';
export * from './seed';

