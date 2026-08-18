import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { errorSchema } from '@/schemas'

export const userMe: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/me',
    {
      schema: {
        summary: "Returns the current user's id.",
        tags: ['Auth'],
        response: {
          200: z.object({
            userId: z.string(),
          }),
          401: errorSchema,
        },
      },
      preHandler: app.auth([app.verifyAccessToken]),
    },
    async (request) => {
      return { userId: request.userId }
    },
  )
}
