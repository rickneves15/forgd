import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { deleteTokensByUserId } from '@/db/repositories/tokens-repository'
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
      await deleteTokensByUserId(request.userId, 'access')
      await deleteTokensByUserId(request.userId, 'refresh')

      return { success: true }
    },
  )
}
