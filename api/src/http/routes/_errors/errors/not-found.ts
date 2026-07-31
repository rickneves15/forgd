import { HttpError } from '../http-error'

export class NotFoundError extends HttpError {
  statusCode = 404
  code = 'NOT_FOUND'

  constructor(message = 'Resource not found') {
    super(message)
  }
}
