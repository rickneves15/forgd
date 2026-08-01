import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { deleteAllTokensByUserId } from '@/functions/auth/delete-all-tokens-by-user-id'
import { errorSchema } from '@/http/errors/schema'
import { auth } from '@/http/middlewares/auth'

export const logout: FastifyPluginAsyncZod = async (app) => {
  app.register(auth).post(
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
    },
    async (request) => {
      const userId = await request.getCurrentUserId()

      await deleteAllTokensByUserId(userId)

      return { success: true }
    },
  )
}
