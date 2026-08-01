import type { FastifyReply } from 'fastify'
import { insertRefreshToken } from '@/db/repositories/refresh-tokens-repository'
import { generateUUID } from '@/lib/uuid'
import {
  createTokenPayload,
  getRefreshTokenExpirationDate,
  hashToken,
  type TokenPayloadRequest,
} from '@/utils/auth'

export const issueTokens = async (
  reply: FastifyReply,
  data: TokenPayloadRequest,
) => {
  const payload = createTokenPayload(data)

  const accessToken = await reply.jwtSign(payload)
  // A unique jti per refresh token makes rotation (SPEC-04) work: without it,
  // two tokens signed in the same second are byte-identical (same sub/iat/exp).
  const refreshToken = await reply.refreshJwtSign({
    ...payload,
    jti: generateUUID(),
  })

  await insertRefreshToken({
    userId: data.userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: getRefreshTokenExpirationDate(),
  })

  return {
    accessToken,
    refreshToken,
  }
}
