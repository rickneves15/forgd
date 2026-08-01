import { HttpError } from './http-error'

export class BadRequestError extends HttpError {
  statusCode = 400

  constructor(message = 'Bad request', code = 'BAD_REQUEST') {
    super(message, code)
  }
}
