import { HttpError } from '../http-error'

export class ConflictError extends HttpError {
  statusCode = 409
  code = 'CONFLICT'

  constructor(message = 'Resource already exists') {
    super(message)
  }
}
