// `useThemeManifest` lives in a 'use client' module. Next.js refuses to call it from a server
// render, so every component that calls it must declare 'use client' itself. jsdom tests cannot
// see that boundary, so this test reads the component sources.
declare global {
  interface ImportMeta {
    glob(pattern: string[], options: { query: '?raw'; import: 'default'; eager: true }): Record<string, string>;
  }
}

const sources = import.meta.glob(['./components/**/*.tsx', '!**/*.test.tsx'], {
  query: '?raw',
  import: 'default',
  eager: true,
});

test('components that read the theme are client components', () => {
  const themed = Object.entries(sources).filter(([, code]) => code.includes('useThemeManifest('));
  expect(themed.length).toBeGreaterThan(0);
  const missing = themed.filter(([, code]) => !code.startsWith("'use client';")).map(([path]) => path);
  expect(missing).toEqual([]);
});
