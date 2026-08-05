import { describe, expect, it } from 'vitest'
import { formatValidationErrors } from './format-validation-errors'

describe('formatValidationErrors', () => {
  it('turns instance paths into a field → message map', () => {
    const errors = formatValidationErrors([
      { instancePath: '/email', message: "must match format 'email'" },
      { instancePath: '/password', message: 'too short' },
    ])

    expect(errors).toEqual({
      email: "must match format 'email'",
      password: 'too short',
    })
  })

  it('strips the leading slash from the field name', () => {
    const errors = formatValidationErrors([
      { instancePath: '/username', message: 'required' },
    ])

    expect(errors).toEqual({ username: 'required' })
  })

  it('keeps the last message per field', () => {
    const errors = formatValidationErrors([
      { instancePath: '/email', message: 'required' },
      { instancePath: '/email', message: 'duplicate' },
    ])

    expect(errors).toEqual({ email: 'duplicate' })
  })

  it('registers fields that failed without a message', () => {
    const errors = formatValidationErrors([{ instancePath: '/code' }])

    expect(errors).toEqual({ code: '' })
  })

  it('returns an empty map for no issues', () => {
    expect(formatValidationErrors([])).toEqual({})
  })
})
