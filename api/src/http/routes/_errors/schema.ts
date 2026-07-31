import { z } from 'zod'

export const validationErrorSchema = z.object({
  code: z.literal('VALIDATION_ERROR'),
  message: z.string(),
  errors: z.record(z.string(), z.string()),
})

export const errorSchema = z.object({
  code: z.string(),
  message: z.string(),
})
