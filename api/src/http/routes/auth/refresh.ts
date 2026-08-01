import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { errorSchema } from '@/http/errors/schema'
import { auth } from '@/http/middlewares/auth'
import { refreshSession } from '@/use-cases/auth/refresh-session'

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
      // validateRefreshToken extracts and verifies the Bearer token; the
      // use-case hashes it for the DB lookup and rotates the session.
      const token = await request.validateRefreshToken()

      return refreshSession(reply, token)
    },
  )
}
