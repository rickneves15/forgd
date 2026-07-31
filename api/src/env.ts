import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.url(),
  JWT_PRIVATE_KEY: z.string().min(1),
  JWT_PUBLIC_KEY: z.string().min(1),
  REFRESH_JWT_PRIVATE_KEY: z.string().min(1),
  REFRESH_JWT_PUBLIC_KEY: z.string().min(1),
})

export const env = envSchema.parse(process.env)
