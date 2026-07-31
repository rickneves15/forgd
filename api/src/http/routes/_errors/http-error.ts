export abstract class HttpError extends Error {
  abstract readonly statusCode: number
  abstract readonly code: string

  constructor(message: string) {
    super(message)

    this.name = new.target.name

    Error.captureStackTrace?.(this, new.target)
  }
}
