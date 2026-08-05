import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { BadRequestError } from '@/http/_errors/errors/bad-request-error'
import { consumeOneTimeCode } from '@/lib/auth/google/one-time-code'
import { errorSchema, validationErrorSchema } from '@/schemas'
import { oauthSuccessSchema } from '@/schemas/auth/oauth'

export const exchange: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/auth/oauth/exchange',
    {
      schema: {
        summary: 'Redeems a one-time code for a token pair.',
        tags: ['Auth'],
        body: z.object({
          code: z.string().min(1),
        }),
        response: {
          200: oauthSuccessSchema,
          400: z.union([validationErrorSchema, errorSchema]),
        },
      },
    },
    async (request) => {
      const { code } = request.body

      const payload = consumeOneTimeCode(code)
      if (!payload) {
        throw new BadRequestError(
          'Invalid or expired code',
          'INVALID_OR_EXPIRED_CODE',
        )
      }

      return payload
    },
  )
}
