import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const read = (name) => readFileSync(new URL(`../.github/workflows/${name}`, import.meta.url), 'utf8');

function assertInOrder(text, markers) {
  let from = 0;
  for (const marker of markers) {
    const at = text.indexOf(marker, from);
    assert.notEqual(at, -1, `"${marker}" is missing or out of order`);
    from = at + marker.length;
  }
}

test('deploy prepares the database before the new version goes live', () => {
  assertInOrder(read('deploy.yml'), [
    'Install database tools',
    'google-github-actions/auth',
    'Migrate database and load reference data',
    'Deploy to Cloud Run',
    'Smoke test',
  ]);
});

test('deploy never writes the database address to the job-wide environment', () => {
  assert.doesNotMatch(read('deploy.yml'), /GITHUB_ENV/);
});

test('the CI container check prepares the database before the smoke test', () => {
  assertInOrder(read('ci.yml'), ['docker compose up', 'db:migrate', 'db:seed', 'smoke.mjs']);
});

test('CI runs the browser tests against its own database after the main checks', () => {
  assertInOrder(read('ci.yml'), [
    'e2e:',
    'needs: verify',
    'postgres:17-alpine',
    'playwright install --with-deps chromium',
    'pnpm build',
    'pnpm e2e',
    'playwright-report',
  ]);
});

// A fresh checkout has no built packages, and the seed loads settings that import a built one.
for (const file of ['deploy.yml', 'ci.yml']) {
  test(`${file} builds the seed's dependencies before running it`, () => {
    assertInOrder(read(file), [
      'pnpm install --frozen-lockfile --filter "@argiva/db..."',
      'pnpm --filter "@argiva/db^..." run build',
      'db:seed',
    ]);
  });
}

test('deploy builds those dependencies before signing in to Google', () => {
  assertInOrder(read('deploy.yml'), ['pnpm --filter "@argiva/db^..." run build', 'google-github-actions/auth']);
});
