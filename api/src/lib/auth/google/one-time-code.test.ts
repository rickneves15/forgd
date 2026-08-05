import { afterEach, describe, expect, it, vi } from 'vitest'
import type { OauthSuccess } from '@/schemas'
import {
  clearOneTimeCodes,
  consumeOneTimeCode,
  createOneTimeCode,
} from './one-time-code'

const payload: OauthSuccess = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  user: {
    id: 'user-1',
    username: 'joaosilva',
    email: 'joao@example.com',
    college: null,
  },
  isNewUser: true,
}

afterEach(() => {
  vi.useRealTimers()
  clearOneTimeCodes()
})

describe('createOneTimeCode / consumeOneTimeCode', () => {
  it('returns the stored payload for a freshly created code', () => {
    const code = createOneTimeCode(payload)
    expect(consumeOneTimeCode(code)).toEqual(payload)
  })

  it('generates a unique code per call', () => {
    expect(createOneTimeCode(payload)).not.toBe(createOneTimeCode(payload))
  })

  it('is single-use — consuming a code twice returns null', () => {
    const code = createOneTimeCode(payload)
    expect(consumeOneTimeCode(code)).toEqual(payload)
    expect(consumeOneTimeCode(code)).toBeNull()
  })

  it('returns null for an unknown code', () => {
    expect(consumeOneTimeCode('never-created')).toBeNull()
  })

  it('returns null for a consumed code after the TTL window', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    const code = createOneTimeCode(payload)
    vi.setSystemTime(Date.now() + 60_001)
    expect(consumeOneTimeCode(code)).toBeNull()
  })

  it('still returns the payload inside the TTL window', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    const code = createOneTimeCode(payload)
    vi.setSystemTime(Date.now() + 30_000)
    expect(consumeOneTimeCode(code)).toEqual(payload)
  })
})
