import type { FastifyInstance } from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
} from 'fastify-type-provider-zod'
import { HttpError } from '@/http/_errors/http-error'
import { formatValidationErrors } from '@/utils/format-validation-errors'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  // Request validation error (400) — the client sent an invalid request
  // (body, params, query, or headers), so it failed before reaching the route.
  if (hasZodFastifySchemaValidationErrors(error)) {
    // Warn: a client mistake, but worth surfacing to spot misbehaving clients.
    request.log.warn({ err: error }, 'Request validation error')

    return reply.status(400).send({
      code: 'VALIDATION_ERROR',
      message: 'Validation error',
      errors: formatValidationErrors(error.validation),
    })
  }

  // Response serialization error (500) — the route ran, but the returned
  // response doesn't match the response schema: a server-side implementation bug.
  if (isResponseSerializationError(error)) {
    request.log.error({ err: error }, 'Response serialization error')

    return reply.status(500).send({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Response serialization error',
      errors: error.cause.issues,
    })
  }

  if (error instanceof HttpError) {
    // Expected domain errors: 4xx are client issues (warn), 5xx are bugs (error).
    request.log[error.statusCode >= 500 ? 'error' : 'warn'](
      { err: error },
      error.message,
    )

    return reply.status(error.statusCode).send({
      code: error.code,
      message: error.message,
    })
  }

  // Unexpected server bug. The pino JSON output is ready to be shipped to any
  // observability platform as-is, with the request id for correlation.
  request.log.error({ err: error }, 'Unhandled error')

  return reply.status(500).send({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error',
  })
}
