import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { auth } from '@/http/middlewares/auth'

export const userMe: FastifyPluginAsyncZod = async (app) => {
  app.register(auth).get(
    '/me',
    {
      schema: {
        summary: "Retrieves the current user's information.",
        tags: ['Auth'],
        response: {
          200: z.object({
            userId: z.string(),
          }),
        },
      },
    },
    async (request) => {
      const userId = await request.getCurrentUserId()

      return { userId }
    },
  )
}
