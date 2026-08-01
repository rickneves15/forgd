import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { errorSchema } from '@/http/errors/schema'
import { auth } from '@/http/middlewares/auth'
import { logoutUser } from '@/use-cases/auth/logout-user'

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

      await logoutUser(userId)

      return { success: true }
    },
  )
}
