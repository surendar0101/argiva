import { fileURLToPath, pathToFileURL } from 'node:url';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const migrationsFolder = fileURLToPath(new URL('./drizzle', import.meta.url));

/** Applies any pending migrations. Safe to repeat; works through a pooled (PgBouncer) connection. */
export async function runMigrations(connectionString: string): Promise<void> {
  const sql = postgres(connectionString, { max: 1, prepare: false, connect_timeout: 10, onnotice: () => {} });
  try {
    await migrate(drizzle(sql), { migrationsFolder });
  } finally {
    await sql.end();
  }
}

const scriptPath = process.argv[1];
if (scriptPath && import.meta.url === pathToFileURL(scriptPath).href) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('✗ DATABASE_URL is not set; refusing to guess which database to migrate');
    process.exitCode = 1;
  } else {
    try {
      await runMigrations(url);
      console.log('✓ Database migrations applied');
    } catch (error) {
      console.error('✗ Database migration failed:', error);
      process.exitCode = 1;
    }
  }
}
