import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { errorSchema } from '@/schemas'
import { revokeTokens } from '@/services/auth/token-pair'

export const logout: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/logout',
    {
      schema: {
        summary: 'Signs out a user.',
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
      await revokeTokens(request.userId)

      return { success: true }
    },
  )
}
