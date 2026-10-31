import { ConfigError, getConfig } from '@argiva/config';

export function validateConfigOrExit(): void {
  try {
    getConfig();
  } catch (error) {
    if (error instanceof ConfigError) {
      console.error(error.message);
      process.exit(1);
    }
    throw error;
  }
}
