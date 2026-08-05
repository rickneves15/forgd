import { describe, expect, it } from 'vitest'
import { BadRequestError } from './errors/bad-request-error'
import { ConflictError } from './errors/conflict-error'
import { NotFoundError } from './errors/not-found-error'
import { UnauthorizedError } from './errors/unauthorized-error'
import { HttpError } from './http-error'

describe('HttpError subclasses', () => {
  it.each([
    [BadRequestError, 400, 'BAD_REQUEST'],
    [UnauthorizedError, 401, 'UNAUTHORIZED'],
    [NotFoundError, 404, 'NOT_FOUND'],
    [ConflictError, 409, 'CONFLICT'],
  ] as const)(
    '%s has the default statusCode and code',
    (ErrorClass, status, code) => {
      const error = new ErrorClass()

      expect(error).toBeInstanceOf(HttpError)
      expect(error.statusCode).toBe(status)
      expect(error.code).toBe(code)
      expect(error.message).toEqual(expect.any(String))
    },
  )

  it('allows routes to pass a specific code and message', () => {
    const error = new ConflictError('Email already in use', 'EMAIL_TAKEN')

    expect(error.statusCode).toBe(409)
    expect(error.code).toBe('EMAIL_TAKEN')
    expect(error.message).toBe('Email already in use')
  })

  it('names the error class on the instance', () => {
    expect(new NotFoundError().name).toBe('NotFoundError')
  })
})
