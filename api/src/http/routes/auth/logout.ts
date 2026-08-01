import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { deleteRefreshTokensByUserId } from '@/db/repositories/refresh-tokens-repository'
import { errorSchema } from '@/http/errors/schema'

export const logout: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/logout',
    {
      schema: {
        summary: 'Revokes a refresh token.',
        tags: ['Auth'],
        response: {
          200: z.object({
            success: z.boolean(),
          }),
          401: errorSchema,
        },
      },
      preHandler: app.auth([app.verifyAccessToken]),
    },
    async (request) => {
      await deleteRefreshTokensByUserId(request.userId)

      return { success: true }
    },
  )
}
