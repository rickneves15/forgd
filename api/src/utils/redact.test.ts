import { describe, expect, it } from 'vitest'
import { redact } from './redact'

describe('redact', () => {
  it('redacts sensitive values in nested objects', () => {
    const input = {
      name: 'Alice',
      email: 'alice@example.com',
      password: 'secret123',
      address: { city: 'X' },
    }

    expect(redact(input)).toEqual({
      name: 'Alice',
      email: 'alice@example.com',
      password: '[redacted]',
      address: { city: 'X' },
    })
  })

  it('redacts accessToken and refreshToken (case-insensitive)', () => {
    const input = { refreshToken: 'a.b.c', tokens: { accessToken: 'x.y.z' } }

    expect(redact(input)).toEqual({
      refreshToken: '[redacted]',
      tokens: { accessToken: '[redacted]' },
    })
  })

  it('redacts inside arrays', () => {
    expect(redact([{ password: 'p' }, { ok: 1 }])).toEqual([
      { password: '[redacted]' },
      { ok: 1 },
    ])
  })

  it('returns primitives unchanged', () => {
    expect(redact('hello')).toBe('hello')
    expect(redact(null)).toBeNull()
    expect(redact(42)).toBe(42)
  })

  it('does not mutate the input', () => {
    const input = { password: 'p' }
    redact(input)
    expect(input.password).toBe('p')
  })
})
