import { z } from 'zod'

// The JWT payload carried by every token the API signs.
export const tokenPayloadSchema = z.object({
  sub: z.string(),
})

export type TokenPayload = z.infer<typeof tokenPayloadSchema>

// Input for creating a payload — the userId that becomes `sub`.
export const tokenPayloadRequestSchema = z.object({
  userId: z.string(),
})

export type TokenPayloadRequest = z.infer<typeof tokenPayloadRequestSchema>
