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


// jsdom has no modal dialog support; real behaviour is covered by the browser tests.
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
}
