import { fastifyCors } from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import { fastifySwagger } from '@fastify/swagger'
import scalarApiReference from '@scalar/fastify-api-reference'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { env } from '@/env'
import { generateUUID } from '../lib/uuid'
import { errorHandler } from './error-handler'
import { login } from './routes/auth/login'
import { logout } from './routes/auth/logout'
import { refresh } from './routes/auth/refresh'
import { register } from './routes/auth/register'
import { userMe } from './routes/auth/userMe'

type BuildAppOptions = {
  logger?: boolean
}

export const buildApp = (options: BuildAppOptions = {}) => {
  const app = fastify({
    // Fastify's built-in pino logger: structured JSON logs in production,
    // pretty-printed in development for readability. Request bodies are never
    // logged (they can contain passwords). Tests pass `logger: false`.
    logger:
      options.logger === false
        ? false
        : {
            level: env.LOG_LEVEL,
            ...(env.NODE_ENV === 'development' && {
              transport: {
                target: 'pino-pretty',
                options: { colorize: true },
              },
            }),
          },
    // Every request gets a traceable id, echoed back as the x-request-id header
    // so a client-side error can be correlated with the server logs.
    genReqId: () => generateUUID(),
  }).withTypeProvider<ZodTypeProvider>()

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.setErrorHandler(errorHandler)

  // Echo the request id back to clients so errors can be traced in the logs.
  app.addHook('onSend', (request, reply, _payload, done) => {
    reply.header('x-request-id', request.id)
    done()
  })

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Forgd API',
        description:
          'A collaboration and discovery platform for hardware engineering projects (electronics, electrical, mechanical, civil, aerospace, chemical). Students can browse/apply to join projects (some paid via stipend), form groups, track tasks/issues inside those groups, and build a track record (project history, peer recognition) other students can see.',
        version: '1.0.0',
      },
    },
    transform: jsonSchemaTransform,
  })

  app.register(scalarApiReference, {
    routePrefix: '/docs',
  })

  app.register(fastifyCors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  })

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

  app.register(login)
  app.register(logout)
  app.register(refresh)
  app.register(register)
  app.register(userMe)

  return app
}
