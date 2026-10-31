import type { NextConfig } from 'next';
import path from 'node:path';
import { securityHeaders } from './src/security-headers';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Trace files from the monorepo root so workspace packages land in the standalone output.
  // next build always runs with apps/web as the working directory.
  outputFileTracingRoot: path.resolve(process.cwd(), '../..'),
  transpilePackages: ['@argiva/ui', '@argiva/config'],
  poweredByHeader: false,
  headers: () => Promise.resolve([{ source: '/:path*', headers: securityHeaders }]),
};

export default nextConfig;
