import { createHash } from 'node:crypto'
import { REFRESH_TOKEN_TTL_MS } from '@/constants'

export type TokenPayload = {
  sub: string
}

export type TokenPayloadRequest = {
  userId: string
}

export const createTokenPayload = (
  data: TokenPayloadRequest,
): TokenPayload => ({
  sub: data.userId,
})

export const getRefreshTokenExpirationDate = () => {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_MS) // 30 days
}

// Refresh tokens are stored only as a SHA-256 hash — the revocation record is
// the row's existence, never the raw JWT (see SPEC-04 §6, schema/auth.ts).
export const hashToken = (token: string) => {
  return createHash('sha256').update(token).digest('hex')
}
