import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3333),
  DATABASE_URL: z
    .string()
    .min(1)
    .default('postgresql://mre:mre_local_password@localhost:5432/mre_news?schema=public'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(30),
});

export const env = envSchema.parse(process.env);
