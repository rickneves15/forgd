import { compare } from 'bcryptjs'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { findUserByEmail } from '@/db/repositories/users-repository'
import { UnauthorizedError } from '@/http/_errors/errors/unauthorized-error'
import { errorSchema, userSchema, validationErrorSchema } from '@/schemas'
import { issueTokenPair } from '@/services/auth/token-pair'

export const login: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/login',
    {
      schema: {
        summary: 'Signs in a user.',
        tags: ['Auth'],
        body: z.object({
          email: z.email().trim(),
          password: z.string().min(1),
        }),
        response: {
          200: z.object({
            accessToken: z.string(),
            refreshToken: z.string(),
            user: userSchema,
          }),
          400: validationErrorSchema,
          401: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const user = await findUserByEmail(email)

      // Unknown email, Google-only account, and wrong password all return the
      // same 401 — the response never reveals whether an account exists. The
      // two branches below intentionally share the message.
      if (!user?.passwordHash) {
        throw new UnauthorizedError(
          'Invalid credentials',
          'INVALID_CREDENTIALS',
        )
      }

      const isPasswordValid = await compare(password, user.passwordHash)
      if (!isPasswordValid) {
        throw new UnauthorizedError(
          'Invalid credentials',
          'INVALID_CREDENTIALS',
        )
      }

      const { accessToken, refreshToken } = await issueTokenPair(reply, {
        userId: user.id,
      })

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          college: user.college,
        },
      }
    },
  )
}
