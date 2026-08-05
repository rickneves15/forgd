import { z } from 'zod'

const envSchema = z.object({
  API_PUBLIC_URL: z.url().default('http://localhost:3333'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.url(),
  JWT_PRIVATE_KEY: z.string().min(1),
  JWT_PUBLIC_KEY: z.string().min(1),
  REFRESH_JWT_PRIVATE_KEY: z.string().min(1),
  REFRESH_JWT_PUBLIC_KEY: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_MOBILE_REDIRECT_URI: z.string().min(1),
})

export const env = envSchema.parse(process.env)
