// Each subclass provides a default `code`; routes may pass a more specific
// one (e.g. ConflictError with EMAIL_TAKEN) so clients can react without
// parsing the message text. The error handler turns these into the
// `{ code, message }` response body.
export abstract class HttpError extends Error {
  abstract readonly statusCode: number
  readonly code: string

  constructor(message: string, code: string) {
    super(message)

    this.code = code

    this.name = new.target.name

    Error.captureStackTrace?.(this, new.target)
  }
}
