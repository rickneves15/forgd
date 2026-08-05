import type { FastifyInstance, FastifyServerOptions } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'
import { env } from '@/env'
import { generateUUID } from '@/lib/uuid'
import { redact } from '@/utils/redact'

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

// Constructor options for the pino logger and per-request id. `logger: false`
// keeps the test setup silent; otherwise it's structured JSON in production,
// pretty-printed in development. Request bodies are only logged at debug
// level, redacted.
export const loggingConfig = (
  enabled: boolean,
): Partial<FastifyServerOptions> => ({
  logger: enabled
    ? {
        level: env.LOG_LEVEL,
        ...(env.NODE_ENV === 'development' && {
          transport: {
            target: 'pino-pretty',
            options: { colorize: true },
          },
        }),
      }
    : false,
  // Every request gets a traceable id, echoed back as the x-request-id header
  // so a client-side error can be correlated with the server logs.
  genReqId: () => generateUUID(),
})

// fastify-plugin: the debug hooks must apply to every route in the app, so
// the plugin can't be encapsulated in its own context.
export const logging = fastifyPlugin(async (app: FastifyInstance) => {
  // Complete request/response details at debug level (LOG_LEVEL=debug). The
  // default info log stays concise; this is opt-in verbosity for debugging.
  // Bodies are logged but redacted. preHandler is used instead of onRequest
  // because the body is only parsed after onRequest runs.
  app.addHook('preHandler', (request, _reply, done) => {
    request.log.debug(
      {
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
        statusCode: reply.statusCode,
        headers: redact(reply.getHeaders()),
        body: redactBody(payload),
      },
      'response sent',
    )
    done()
  })
})
