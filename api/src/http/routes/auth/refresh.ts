import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import {
  deleteRefreshTokensByUserId,
  findRefreshTokenByHash,
} from '@/db/repositories/refresh-tokens-repository'
import { errorSchema } from '@/http/errors/schema'
import { UnauthorizedError } from '@/http/errors/unauthorized-error'
import { auth } from '@/http/middlewares/auth'
import { issueTokenPair } from '@/lib/auth/tokens'
import { hashToken } from '@/utils/auth'

export const refresh: FastifyPluginAsyncZod = async (app) => {
  app.register(auth).post(
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
    },
    async (request, reply) => {
      // validateRefreshToken extracts and verifies the Bearer token, returning
      // its raw value so it can be hashed for the DB lookup.
      const token = await request.validateRefreshToken()
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
