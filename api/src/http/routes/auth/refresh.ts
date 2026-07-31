import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '@/db'
import { refreshTokens } from '@/db/schema'
import { deleteAllTokensByUserId } from '@/functions/auth/delete-all-tokens-by-user-id.js'
import { getTokens } from '@/functions/auth/get-tokens-tokens.js'
import { auth } from '@/http/middlewares/auth.js'
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
      const userId = await request.getCurrentUserId()

      const [storedToken] = await db
        .select({
          id: refreshTokens.id,
          userId: refreshTokens.userId,
          expiresAt: refreshTokens.expiresAt,
        })
        .from(refreshTokens)
        .where(eq(refreshTokens.userId, userId))
        .limit(1)

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedError('Invalid refresh token')
      }

      await deleteAllTokensByUserId(userId)

      const { accessToken, refreshToken } = await getTokens(reply, {
        userId,
      })

      return {
        accessToken,
        refreshToken,
      }
    },
  )
}
