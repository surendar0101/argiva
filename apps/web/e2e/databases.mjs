// Shared by the database preparation step and the test servers.
export const POSTGRES_URL = (
  process.env.E2E_POSTGRES_URL ?? 'postgres://argiva:argiva_local_only@127.0.0.1:5432'
).replace(/\/+$/, '');

export const FULL_DATABASE = 'argiva_e2e';
export const EMPTY_DATABASE = 'argiva_empty_e2e';

export const databaseUrl = (name) => `${POSTGRES_URL}/${name}`;
