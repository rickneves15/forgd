import { HttpError } from '../http-error'

export class UnauthorizedError extends HttpError {
  statusCode = 401
  code = 'UNAUTHORIZED'

  constructor(message = 'Unauthorized') {
    super(message)
  }
}
