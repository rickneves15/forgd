import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import {
  deleteTokensByUserId,
  findTokenByHashAndType,
} from '@/db/repositories/tokens-repository'
import { UnauthorizedError } from '@/http/_errors/errors/unauthorized-error'
import { hashToken } from '@/lib/auth/hash'
import { errorSchema } from '@/schemas'
import { issueTokenPair } from '@/services/auth/token-pair'

export const refresh: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/refresh',
    {
      schema: {
        summary: 'Rotates a refresh token.',
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

      const storedToken = await findTokenByHashAndType(tokenHash, 'refresh')

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedError(
          'Invalid refresh token',
          'INVALID_REFRESH_TOKEN',
        )
      }

      // Rotation: revoke every token the user holds — the presented refresh
      // token and all outstanding access tokens — then issue a fresh pair. A
      // leaked old pair can't be replayed after the legitimate client has
      // refreshed.
      await deleteTokensByUserId(storedToken.userId, 'refresh')
      await deleteTokensByUserId(storedToken.userId, 'access')

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
