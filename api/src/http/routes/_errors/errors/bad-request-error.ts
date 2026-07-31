import { HttpError } from '../http-error'

export class BadRequestError extends HttpError {
  statusCode = 400
  code = 'BAD_REQUEST'

  constructor(message = 'Bad request') {
    super(message)
  }
}
