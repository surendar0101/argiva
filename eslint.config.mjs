import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import { existsSync } from 'node:fs';
import tseslint from 'typescript-eslint';

// eslint-config-next loads `next` (its Babel parser) on import, so it can only load once apps/web installs Next.
const nextVitals = existsSync('apps/web/package.json')
  ? (await import('eslint-config-next/core-web-vitals')).default
  : [];

export default defineConfig([
  globalIgnores([
    '**/node_modules/**', '**/dist/**', '**/.next/**', '**/.turbo/**',
    '**/next-env.d.ts', 'sdd/**', '.github/skills/**',
  ]),
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: globals.node },
  },
  { files: ['apps/web/**/*.{js,mjs,ts,tsx}'], extends: [nextVitals], settings: { next: { rootDir: 'apps/web' } } },
  {
    files: ['packages/ui/src/**/*.tsx', 'apps/ui-preview/src/**/*.tsx'],
    extends: [jsxA11y.flatConfigs.recommended, reactHooks.configs.flat.recommended],
  },
  {
    // Phase 1 ButtonLink: children reach <a> through {...rest}, which the rule cannot see.
    files: ['packages/ui/src/components/Button/Button.tsx'],
    rules: { 'jsx-a11y/anchor-has-content': 'off' },
  },
  {
    // ADR 0012: only @argiva/config reads the environment.
    files: ['apps/*/src/**/*.{ts,tsx}', 'packages/*/src/**/*.{ts,tsx}'],
    ignores: ['packages/config/**', 'apps/web/src/instrumentation.ts'],
    rules: {
      'no-restricted-properties': ['error', {
        object: 'process', property: 'env',
        message: 'Read settings through @argiva/config (ADR 0012).',
      }],
    },
  },
]);
