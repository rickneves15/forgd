import fastifyJwt from '@fastify/jwt'
import type { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'
import { env } from '@/env'

// fastify-plugin: routes call reply.jwtSign/refreshJwtVerify, so the
// decorators must be registered on the root scope, not an encapsulated one.
export const jwt = fastifyPlugin(async (app: FastifyInstance) => {
  app.register(fastifyJwt, {
    secret: {
      private: env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n'),
      public: env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n'),
    },

    sign: {
      algorithm: 'RS256',
      expiresIn: '15m',
    },
  })

  app.register(fastifyJwt, {
    namespace: 'refresh',

    jwtSign: 'refreshJwtSign',
    jwtVerify: 'refreshJwtVerify',

    secret: {
      private: env.REFRESH_JWT_PRIVATE_KEY.replace(/\\n/g, '\n'),
      public: env.REFRESH_JWT_PUBLIC_KEY.replace(/\\n/g, '\n'),
    },

    sign: {
      algorithm: 'RS256',
      expiresIn: '30d',
    },
  })
})
