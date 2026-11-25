import '@testing-library/jest-dom/vitest';

// Set up test environment variables
process.env.APP_ENV = 'local';
process.env.APP_BASE_URL = 'http://localhost:3000';
process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/argiva';
process.env.INSTAGRAM_URL = 'https://www.instagram.com/argiva_silvers/';
process.env.STORAGE_DRIVER = 'local';
process.env.STORAGE_LOCAL_DIR = './.data/uploads';
process.env.DEFAULT_THEME_ID = 'quiet-luxury';
process.env.LOG_LEVEL = 'error'; // Suppress logs during tests

