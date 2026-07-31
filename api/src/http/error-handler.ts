import type { FastifyInstance } from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
} from 'fastify-type-provider-zod'
import { formatValidationErrors } from '@/utils/format-validation-errors'
import { HttpError } from './routes/_errors/http-error'

type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, _request, reply) => {
  // Request validation error (400)
  // The client sent an invalid request (body, params, query, or headers).
  // The request failed validation before reaching the route handler.
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      code: 'VALIDATION_ERROR',
      message: 'Validation error',
      errors: formatValidationErrors(error.validation),
    })
  }

  // Response serialization error (500)
  // The route executed successfully, but the returned response does not
  // match the response schema. This indicates a server-side implementation error.
  if (isResponseSerializationError(error)) {
    return reply.status(500).send({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Response serialization error',
      errors: error.cause.issues,
    })
  }

  if (error instanceof HttpError) {
    return reply.status(error.statusCode).send({
      code: error.code,
      message: error.message,
    })
  }

  console.error(error)

  // send error to some observability platform

  return reply.status(500).send({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error',
  })
}
