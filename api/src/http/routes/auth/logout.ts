import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { deleteRefreshTokensByUserId } from '@/db/repositories/refresh-tokens-repository'
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

      await deleteRefreshTokensByUserId(userId)

      return { success: true }
    },
  )
}
