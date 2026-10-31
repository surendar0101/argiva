export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { validateConfigOrExit } = await import('./instrumentation-node');
  validateConfigOrExit();
}
