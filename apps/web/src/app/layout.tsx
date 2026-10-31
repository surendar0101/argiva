import { getConfig } from '@argiva/config';
import '@argiva/ui/fonts';
import '@argiva/ui/global.css';
import type { Metadata } from 'next';
import { connection } from 'next/server';
import type { ReactNode } from 'react';
import { ThemeProvider } from './theme-provider';

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const isProduction = getConfig().appEnv === 'production';
  return {
    title: 'ARGIVA Silvers',
    description: 'Modern Silver. Timeless Stories.',
    robots: { index: isProduction, follow: isProduction },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  await connection();
  const { defaultThemeId } = getConfig();
  return (
    <html lang="en-IN" data-theme={defaultThemeId}>
      <body>
        <ThemeProvider themeId={defaultThemeId}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
