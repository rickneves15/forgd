import { HttpError } from '../http-error'

export class ConflictError extends HttpError {
  statusCode = 409

  constructor(message = 'Resource already exists', code = 'CONFLICT') {
    super(message, code)
  }
}
