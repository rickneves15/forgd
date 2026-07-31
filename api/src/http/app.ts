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
import { redact } from '../utils/redact'
import { errorHandler } from './error-handler'
import { login } from './routes/auth/login'
import { logout } from './routes/auth/logout'
import { refresh } from './routes/auth/refresh'
import { register } from './routes/auth/register'
import { userMe } from './routes/auth/userMe'

// The onSend payload is a serialized JSON string; parse it back so the log
// shows a structured body instead of an escaped string. Non-JSON payloads
// (binary, streams, the docs HTML page) cannot be redacted, so they are
// replaced with a placeholder marker instead of being logged raw.
const redactBody = (payload: unknown) => {
  if (typeof payload === 'string') {
    try {
      return redact(JSON.parse(payload))
    } catch {
      return '[non-json payload]'
    }
  }

  if (Buffer.isBuffer(payload)) {
    return '[binary payload]'
  }

  return redact(payload)
}

type BuildAppOptions = {
  logger?: boolean
}

export const buildApp = (options: BuildAppOptions = {}) => {
  const app = fastify({
    // Fastify's built-in pino logger: structured JSON logs in production,
    // pretty-printed in development for readability. Request bodies are only
    // logged at debug level, redacted (see ADR-004). Tests pass
    // `logger: false`.
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

  // Complete request/response details at debug level (LOG_LEVEL=debug). The
  // default info log stays concise; this is opt-in verbosity for debugging.
  // Bodies are logged but redacted (see ADR-004). preHandler is used instead
  // of onRequest because the body is only parsed after onRequest runs.
  app.addHook('preHandler', (request, _reply, done) => {
    request.log.debug(
      {
        requestId: request.id,
        method: request.method,
        url: request.url,
        headers: redact(request.headers),
        body: redact(request.body),
      },
      'incoming request',
    )
    done()
  })

  // Echo the request id back to clients so errors can be traced in the logs.
  app.addHook('onSend', (request, reply, payload, done) => {
    reply.header('x-request-id', request.id)

    request.log.debug(
      {
        requestId: request.id,
        statusCode: reply.statusCode,
        headers: redact(reply.getHeaders()),
        body: redactBody(payload),
      },
      'response sent',
    )
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
