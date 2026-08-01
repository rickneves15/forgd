import { HttpError } from './http-error'

export class NotFoundError extends HttpError {
  statusCode = 404

  constructor(message = 'Resource not found', code = 'NOT_FOUND') {
    super(message, code)
  }
}
