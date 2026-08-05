import { buildTestApp } from '@test/helpers/app'
import { truncateAll } from '@test/helpers/db'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearOneTimeCodes,
  createOneTimeCode,
} from '@/lib/auth/google/one-time-code'

const app = buildTestApp()

const payload = {
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

describe('POST /auth/oauth/exchange', () => {
  beforeEach(async () => {
    await truncateAll()
    clearOneTimeCodes()
  })

  it('returns the stored success payload for a valid one-time code', async () => {
    const code = createOneTimeCode(payload)

    const res = await app.inject({
      method: 'POST',
      url: '/auth/oauth/exchange',
      payload: { code },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual(payload)
  })

  it('rejects a used code with 400 INVALID_OR_EXPIRED_CODE', async () => {
    const code = createOneTimeCode(payload)

    const first = await app.inject({
      method: 'POST',
      url: '/auth/oauth/exchange',
      payload: { code },
    })
    expect(first.statusCode).toBe(200)

    const replay = await app.inject({
      method: 'POST',
      url: '/auth/oauth/exchange',
      payload: { code },
    })

    expect(replay.statusCode).toBe(400)
    expect(replay.json()).toEqual({
      code: 'INVALID_OR_EXPIRED_CODE',
      message: 'Invalid or expired code',
    })
  })

  it('rejects an unknown code with 400 INVALID_OR_EXPIRED_CODE', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/oauth/exchange',
      payload: { code: 'never-created' },
    })

    expect(res.statusCode).toBe(400)
    expect(res.json().code).toBe('INVALID_OR_EXPIRED_CODE')
  })

  it('rejects an expired code with 400 INVALID_OR_EXPIRED_CODE', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    const code = createOneTimeCode(payload)
    vi.setSystemTime(Date.now() + 60_001)

    const res = await app.inject({
      method: 'POST',
      url: '/auth/oauth/exchange',
      payload: { code },
    })
    vi.useRealTimers()

    expect(res.statusCode).toBe(400)
    expect(res.json().code).toBe('INVALID_OR_EXPIRED_CODE')
  })

  it('returns 400 VALIDATION_ERROR when the code is missing', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/oauth/exchange',
      payload: {},
    })

    expect(res.statusCode).toBe(400)
    expect(res.json().code).toBe('VALIDATION_ERROR')
  })
})
