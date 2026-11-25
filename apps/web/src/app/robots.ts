import { getConfig } from '@argiva/config';
import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  const { appEnv, baseUrl } = getConfig();
  const isProduction = appEnv === 'production';

  return {
    rules: {
      userAgent: '*',
      ...(isProduction ? { allow: '/' } : { disallow: '/' }),
    },
    sitemap: new URL('/sitemap.xml', baseUrl).toString(),
  };
}
