import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { updateUserInterests } from '@/db/repositories/users-repository'
import { INTEREST_TAGS } from '@/db/schema/constants'
import { NotFoundError } from '@/http/_errors/errors/not-found-error'
import { errorSchema, validationErrorSchema } from '@/schemas'

export const updateInterests: FastifyPluginAsyncZod = async (app) => {
  app.put(
    '/users/me/interests',
    {
      schema: {
        summary: 'Saves the current user\u2019s onboarding interest tags.',
        tags: ['Users'],
        body: z.object({
          interests: z.array(z.enum(INTEREST_TAGS)),
        }),
        response: {
          200: z.object({
            interests: z.array(z.enum(INTEREST_TAGS)),
          }),
          // 400 covers Zod body validation (unknown tag). 404 guards the
          // defensive "caller row missing" case so the 200 shape can never
          // serialize { interests: null }.
          400: z.union([validationErrorSchema, errorSchema]),
          401: errorSchema,
          404: errorSchema,
        },
      },
      preHandler: app.auth([app.verifyAccessToken]),
    },
    async (request) => {
      const { interests } = request.body

      const saved = await updateUserInterests(request.userId, interests)

      if (saved === null) {
        throw new NotFoundError('User not found', 'USER_NOT_FOUND')
      }

      return { interests: saved }
    },
  )
}
