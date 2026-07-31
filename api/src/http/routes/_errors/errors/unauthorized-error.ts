import { HttpError } from '../http-error'

export class UnauthorizedError extends HttpError {
  statusCode = 401

  constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    super(message, code)
  }
}
