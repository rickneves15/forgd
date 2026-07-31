import { hash } from 'bcryptjs'
import { eq, or } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { BCRYPT_SALT_ROUNDS } from '@/constants'
import { db } from '@/db'
import { users } from '@/db/schema'
import { getTokens } from '@/functions/auth/get-tokens-tokens'
import { BadRequestError } from '../_errors/errors/bad-request-error'
import { ConflictError } from '../_errors/errors/conflict-error'
import { errorSchema, validationErrorSchema } from '../_errors/schema'

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
          200: z.object({
            accessToken: z.string(),
            refreshToken: z.string(),
            user: createSelectSchema(users).pick({
              id: true,
              username: true,
              email: true,
              college: true,
            }),
          }),
          400: validationErrorSchema,
          409: errorSchema,
        },
      },
    },
    async (request, reply) => {
      const { username, email, password, college } = request.body

      const [userWithSameUsernameOrEmail] = await db
        .select()
        .from(users)
        .where(or(eq(users.email, email), eq(users.username, username)))
        .limit(1)

      if (userWithSameUsernameOrEmail) {
        throw new ConflictError('User with this email already exists')
      }

      const passwordHash = await hash(password, BCRYPT_SALT_ROUNDS)

      const [user] = await db
        .insert(users)
        .values({
          username,
          email,
          passwordHash,
          college,
        })
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          college: users.college,
        })

      if (!user) {
        throw new BadRequestError('Failed to create user')
      }

      const { accessToken, refreshToken } = await getTokens(reply, {
        userId: user.id,
      })

      return {
        accessToken,
        refreshToken,
        user,
      }
    },
  )
}
