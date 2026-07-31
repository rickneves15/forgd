import { compare } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '@/db'
import { users } from '@/db/schema'
import { getTokens } from '@/functions/auth/get-tokens.js'
import { UnauthorizedError } from '../_errors/errors/unauthorized-error.js'
import { errorSchema, validationErrorSchema } from '../_errors/schema.js'

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

      const [user] = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          college: users.college,
          passwordHash: users.passwordHash,
        })
        .from(users)
        .where(eq(users.email, email))
        .limit(1)

      // Unknown email, Google-only account, and wrong password all return the
      // same 401 — the response never reveals whether an account exists
      // (SPEC-02). The two branches below intentionally share the message.
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

      const { accessToken, refreshToken } = await getTokens(reply, {
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
