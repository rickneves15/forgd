import { createSelectSchema } from 'drizzle-zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { users } from '@/db/schema'
import { errorSchema, validationErrorSchema } from '@/http/errors/schema'
import { createTokenSigner } from '@/http/token-signer'
import { registerUser } from '@/use-cases/auth/register-user'

export const register: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/register',
    {
      schema: {
        summary: 'Creates a new account.',
        tags: ['Auth'],
        body: createSelectSchema(users)
          .pick({
            username: true,
            email: true,
            college: true,
          })
          .extend({
            password: z.string().min(8),
            username: z.string().min(3).max(30),
            email: z.email().trim(),
            college: z.string().max(120).optional(),
          }),
        response: {
          201: z.object({
            accessToken: z.string(),
            refreshToken: z.string(),
            user: createSelectSchema(users).pick({
              id: true,
              username: true,
              email: true,
              college: true,
            }),
          }),
          // 400 is used for both schema validation and the defensive "user
          // insert returned no row" error, so both body shapes are allowed.
          400: z.union([validationErrorSchema, errorSchema]),
          409: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const { username, email, password, college } = request.body

      const result = await registerUser(createTokenSigner(reply), {
        username,
        email,
        password,
        college,
      })

      // Fastify defaults to 200 on any response with a body — the spec's 201
      // must be set explicitly (SPEC-01).
      return reply.status(201).send(result)
    },
  )
}
