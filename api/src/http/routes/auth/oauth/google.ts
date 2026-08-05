import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { NotFoundError } from '@/http/_errors/errors/not-found-error'
import { googleAuth } from '@/http/plugins/oauth/google'
import { errorSchema } from '@/schemas'

// Both Google routes are handled entirely by the `googleAuth` preValidation
// hook: it redirects to Google on the start route, and on the callback route
// it exchanges the code and redirects to the mobile deep link. The handlers
// below never run — reaching one means the hook did not reply, which would be
// a bug, so they surface a 404 instead of a silent empty 200.
export const googleOauth: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/auth/oauth/google',
    {
      schema: {
        summary: 'Starts Google sign-in.',
        tags: ['Auth'],
        // The 302 has no body; the 404 is the bug-guard handler below, which
        // should never actually respond.
        response: {
          302: z.object({}),
          404: errorSchema,
        },
      },
      preValidation: [googleAuth],
    },
    async () => {
      throw new NotFoundError()
    },
  )

  app.get(
    '/auth/oauth/google/callback',
    {
      schema: {
        summary: 'Completes Google sign-in.',
        tags: ['Auth'],
        response: {
          302: z.object({}),
          401: errorSchema,
          404: errorSchema,
        },
      },
      preValidation: [googleAuth],
    },
    async () => {
      throw new NotFoundError()
    },
  )
}
