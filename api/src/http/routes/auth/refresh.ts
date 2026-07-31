import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '@/db'
import { refreshTokens } from '@/db/schema'
import { deleteAllTokensByUserId } from '@/functions/auth/delete-all-tokens-by-user-id.js'
import { getTokens } from '@/functions/auth/get-tokens.js'
import { auth } from '@/http/middlewares/auth.js'
import { hashToken } from '@/utils/auth.js'
import { UnauthorizedError } from '../_errors/errors/unauthorized-error.js'
import { errorSchema } from '../_errors/schema.js'

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

      const [storedToken] = await db
        .select({
          userId: refreshTokens.userId,
          expiresAt: refreshTokens.expiresAt,
        })
        .from(refreshTokens)
        .where(eq(refreshTokens.tokenHash, tokenHash))
        .limit(1)

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedError(
          'Invalid refresh token',
          'INVALID_REFRESH_TOKEN',
        )
      }

      // Rotation (SPEC-04): revoke every token the user holds, then issue a
      // fresh pair. The presented token is now dead, so a leaked copy can't
      // be replayed after the legitimate client has refreshed.
      await deleteAllTokensByUserId(storedToken.userId)

      const { accessToken, refreshToken } = await getTokens(reply, {
        userId: storedToken.userId,
      })

      return {
        accessToken,
        refreshToken,
      }
    },
  )
}
