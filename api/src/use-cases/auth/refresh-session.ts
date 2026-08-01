import type { FastifyReply } from 'fastify'
import {
  deleteRefreshTokensByUserId,
  findRefreshTokenByHash,
} from '@/db/repositories/refresh-tokens-repository'
import { UnauthorizedError } from '@/http/errors/unauthorized-error'
import { hashToken } from '@/utils/auth'
import { issueTokens } from './issue-tokens'

export const refreshSession = async (reply: FastifyReply, token: string) => {
  const tokenHash = hashToken(token)

  const storedToken = await findRefreshTokenByHash(tokenHash)

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new UnauthorizedError(
      'Invalid refresh token',
      'INVALID_REFRESH_TOKEN',
    )
  }

  // Rotation (SPEC-04): revoke every token the user holds, then issue a
  // fresh pair. The presented token is now dead, so a leaked copy can't
  // be replayed after the legitimate client has refreshed.
  await deleteRefreshTokensByUserId(storedToken.userId)

  return issueTokens(reply, { userId: storedToken.userId })
}
