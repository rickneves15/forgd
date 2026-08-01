import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { errorSchema, validationErrorSchema } from '@/http/errors/schema'
import { loginUser } from '@/use-cases/auth/login-user'

export const login: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/login',
    {
      schema: {
        summary: 'Signs in an existing account.',
        tags: ['Auth'],
        body: z.object({
          email: z.email().trim(),
          password: z.string().min(1),
        }),
        response: {
          200: z.object({
            accessToken: z.string(),
            refreshToken: z.string(),
            user: z.object({
              id: z.string(),
              username: z.string(),
              email: z.string(),
              college: z.string().nullable().optional(),
            }),
          }),
          400: validationErrorSchema,
          401: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      return loginUser(reply, { email, password })
    },
  )
}
