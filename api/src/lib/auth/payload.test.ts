import { describe, expect, it, vi } from 'vitest'
import { ACCESS_TOKEN_TTL_MS, REFRESH_TOKEN_TTL_MS } from '@/constants'
import { createTokenPayload, getRefreshTokenExpirationDate } from './payload'

describe('createTokenPayload', () => {
  it('maps userId to the standard sub claim', () => {
    expect(createTokenPayload({ userId: 'user-1' })).toEqual({
      sub: 'user-1',
    })
  })
})

describe('getRefreshTokenExpirationDate', () => {
  it('expires 30 days after now', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))

    const expiresAt = getRefreshTokenExpirationDate()

    expect(expiresAt.getTime()).toBe(
      new Date('2026-01-01T00:00:00Z').getTime() + REFRESH_TOKEN_TTL_MS,
    )
    expect(REFRESH_TOKEN_TTL_MS).toBe(30 * 24 * 60 * 60 * 1000)
    expect(ACCESS_TOKEN_TTL_MS).toBe(15 * 60 * 1000)

    vi.useRealTimers()
  })
})
