import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { updateUserInterests } from '@/db/repositories/users-repository'
import { INTEREST_TAGS } from '@/db/schema/constants'
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
          // 400 covers Zod body validation (unknown tag). SPEC-05 §4.5 lists
          // only VALIDATION_ERROR; auth guarantees the caller exists, so the
          // row is always present and no 404 is reachable.
          400: z.union([validationErrorSchema, errorSchema]),
          401: errorSchema,
        },
      },
      preHandler: app.auth([app.verifyAccessToken]),
    },
    async (request) => {
      const { interests } = request.body

      const saved = await updateUserInterests(request.userId, interests)

      return { interests: saved }
    },
  )
}
