import { hash } from 'bcryptjs'
import { createSelectSchema } from 'drizzle-zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { BCRYPT_SALT_ROUNDS } from '@/constants'
import {
  createUser,
  findUserByEmailOrUsername,
} from '@/db/repositories/users-repository'
import { users } from '@/db/schema'
import { BadRequestError } from '@/http/errors/bad-request-error'
import { ConflictError } from '@/http/errors/conflict-error'
import { errorSchema, validationErrorSchema } from '@/http/errors/schema'
import { issueTokenPair } from '@/lib/auth/tokens'

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

      const userWithSameUsernameOrEmail = await findUserByEmailOrUsername(
        email,
        username,
      )

      // Distinct codes let a client tell an existing email apart from a taken
      // username without parsing the message text (SPEC-01).
      if (userWithSameUsernameOrEmail) {
        if (userWithSameUsernameOrEmail.email === email) {
          throw new ConflictError('Email already registered', 'EMAIL_TAKEN')
        }

        throw new ConflictError('Username already taken', 'USERNAME_TAKEN')
      }

      const passwordHash = await hash(password, BCRYPT_SALT_ROUNDS)

      const user = await createUser({ username, email, passwordHash, college })

      if (!user) {
        throw new BadRequestError('Failed to create user')
      }

      const { accessToken, refreshToken } = await issueTokenPair(reply, {
        userId: user.id,
      })

      // Fastify defaults to 200 on any response with a body — the spec's 201
      // must be set explicitly (SPEC-01).
      return reply.status(201).send({
        accessToken,
        refreshToken,
        user,
      })
    },
  )
}
