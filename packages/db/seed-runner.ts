import { pathToFileURL } from 'node:url';
import { closeDb, getDb, seedDatabase } from './src/index.js';

export async function runSeed(): Promise<void> {
  try {
    await seedDatabase(getDb());
    console.log('✓ Database seeded successfully');
  } catch (error) {
    console.error('✗ Database seed failed:', error);
    process.exitCode = 1;
  } finally {
    await closeDb();
  }
}

const scriptPath = process.argv[1];
if (scriptPath && import.meta.url === pathToFileURL(scriptPath).href) {
  await runSeed();
}
