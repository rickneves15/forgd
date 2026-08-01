import type { FastifyReply } from 'fastify'
import { ACCESS_TOKEN_TTL_MS } from '@/constants'
import { insertToken } from '@/db/repositories/tokens-repository'
import { hashToken } from '@/lib/auth/hash'
import {
  createTokenPayload,
  getRefreshTokenExpirationDate,
  type TokenPayloadRequest,
} from '@/lib/auth/payload'
import { generateUUID } from '@/lib/uuid'

// Signs a fresh access + refresh pair and persists both hashes so rotation and
// revocation (SPEC-04) have a record to check. Used by the register, login and
// refresh routes. The DB row is the revocation record for both token types:
// delete it and the JWT stops being accepted, even before it expires.
export const issueTokenPair = async (
  reply: FastifyReply,
  data: TokenPayloadRequest,
) => {
  const payload = createTokenPayload(data)

  // A unique jti per token makes rotation (SPEC-04) work: without it, two
  // access or refresh tokens signed in the same second are byte-identical
  // (same sub/iat/exp), so a "new" token is indistinguishable from the old
  // one it replaces.
  const accessToken = await reply.jwtSign({
    ...payload,
    jti: generateUUID(),
  })
  const refreshToken = await reply.refreshJwtSign({
    ...payload,
    jti: generateUUID(),
  })

  await insertToken({
    userId: data.userId,
    type: 'access',
    tokenHash: hashToken(accessToken),
    expiresAt: new Date(Date.now() + ACCESS_TOKEN_TTL_MS),
  })
  await insertToken({
    userId: data.userId,
    type: 'refresh',
    tokenHash: hashToken(refreshToken),
    expiresAt: getRefreshTokenExpirationDate(),
  })

  return {
    accessToken,
    refreshToken,
  }
}
