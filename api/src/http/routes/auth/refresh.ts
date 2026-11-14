import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { errorSchema } from '@/schemas'
import { rotateTokens } from '@/services/auth/token-pair'

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
      // verifyRefreshToken verifies the JWT and the revocation record,
      // exposing the user id on request.userId.
      preHandler: app.auth([app.verifyRefreshToken]),
    },
    async (request, reply) => {
      const { accessToken, refreshToken } = await rotateTokens(
        reply,
        request.userId,
      )

      return {
        accessToken,
        refreshToken,
      }
    },
  )
}
