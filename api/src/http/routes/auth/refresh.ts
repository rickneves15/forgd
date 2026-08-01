import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import {
  deleteRefreshTokensByUserId,
  findRefreshTokenByHash,
} from '@/db/repositories/refresh-tokens-repository'
import { errorSchema } from '@/http/errors/schema'
import { UnauthorizedError } from '@/http/errors/unauthorized-error'
import { hashToken } from '@/lib/auth/hash'
import { issueTokenPair } from '@/lib/auth/tokens'

export const refresh: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/refresh',
    {
      schema: {
        summary: 'Rotates a refresh token into a fresh token pair.',
        tags: ['Auth'],
        response: {
          200: z.object({
            accessToken: z.string(),
            refreshToken: z.string(),
          }),
          401: errorSchema,
        },
      },
      // verifyRefreshToken extracts and verifies the Bearer token, exposing
      // its raw value so the handler can hash it for the DB lookup.
      preHandler: app.auth([app.verifyRefreshToken]),
    },
    async (request, reply) => {
      const tokenHash = hashToken(request.rawRefreshToken)

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

      const { accessToken, refreshToken } = await issueTokenPair(reply, {
        userId: storedToken.userId,
      })

      return {
        accessToken,
        refreshToken,
      }
    },
  )
}
