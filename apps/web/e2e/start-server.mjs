// Runs the production build against one test database: node e2e/start-server.mjs <port> <database>
import { fileURLToPath } from 'node:url';
import { databaseUrl } from './databases.mjs';

const [port, database] = process.argv.slice(2);

if (!port || !database?.endsWith('_e2e')) {
  console.error('usage: node e2e/start-server.mjs <port> <database ending in _e2e>');
  process.exit(2);
}

Object.assign(process.env, {
  APP_ENV: 'local',
  APP_BASE_URL: `http://127.0.0.1:${port}`,
  DATABASE_URL: databaseUrl(database),
  STORAGE_DRIVER: 'local',
  STORAGE_LOCAL_DIR: './.data/uploads',
  PORT: port,
  HOSTNAME: '127.0.0.1',
});

await import(fileURLToPath(new URL('../.next/standalone/apps/web/server.js', import.meta.url)));
