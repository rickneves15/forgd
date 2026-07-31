import type { FastifyReply } from 'fastify'
import { db } from '@/db'
import { refreshTokens } from '@/db/schema'
import {
  createTokenPayload,
  getRefreshTokenExpirationDate,
  type TokenPayloadRequest,
} from '@/utils/auth'

export const getTokens = async (
  reply: FastifyReply,
  data: TokenPayloadRequest,
) => {
  const { userId } = data

  const payload = createTokenPayload(data)

  const accessToken = await reply.jwtSign(payload)
  const refreshToken = await reply.refreshJwtSign(payload)

  await db.insert(refreshTokens).values({
    userId: userId,
    tokenHash: refreshToken,
    expiresAt: getRefreshTokenExpirationDate(),
  })

  return {
    accessToken,
    refreshToken,
  }
}
