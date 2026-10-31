import { defaultThemeId, isThemeId, type ThemeId } from '@argiva/design-tokens';
import { z } from 'zod';

const R2_KEYS = ['R2_ACCOUNT_ID', 'R2_BUCKET', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'] as const;
const optionalText = z.string().min(1).optional();

export const envSchema = z
  .object({
    APP_ENV: z.enum(['local', 'staging', 'production']),
    APP_BASE_URL: z.url(),
    APP_VERSION: z.string().min(1).default('dev'),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    DATABASE_URL: z.string().regex(/^postgres(?:ql)?:\/\/.+/, 'must start with postgres:// or postgresql://'),
    STORAGE_DRIVER: z.enum(['local', 'r2']),
    STORAGE_LOCAL_DIR: optionalText,
    R2_ACCOUNT_ID: optionalText,
    R2_BUCKET: optionalText,
    R2_ACCESS_KEY_ID: optionalText,
    R2_SECRET_ACCESS_KEY: optionalText,
    DEFAULT_THEME_ID: z
      .custom<ThemeId>((v) => typeof v === 'string' && isThemeId(v), { message: 'must be a registered theme id' })
      .default(defaultThemeId),
  })
  .superRefine((env, ctx) => {
    if (env.APP_ENV !== 'local' && !env.APP_BASE_URL.startsWith('https://')) {
      ctx.addIssue({ code: 'custom', path: ['APP_BASE_URL'], message: 'must use https outside local' });
    }
    if (env.STORAGE_DRIVER === 'local' && !env.STORAGE_LOCAL_DIR) {
      ctx.addIssue({ code: 'custom', path: ['STORAGE_LOCAL_DIR'], message: 'required when STORAGE_DRIVER=local' });
    }
    if (env.STORAGE_DRIVER === 'r2') {
      for (const key of R2_KEYS) {
        if (!env[key]) ctx.addIssue({ code: 'custom', path: [key], message: 'required when STORAGE_DRIVER=r2' });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;
