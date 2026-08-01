import { buildTestApp } from '@test/helpers/app'
import { registerUser } from '@test/helpers/auth/register-user'
import { testDb, truncateAll } from '@test/helpers/db'
import { and, eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'
import { tokens } from '@/db/schema'
import { hashToken } from '@/lib/auth/hash'

const app = buildTestApp()

const refresh = (token?: string) =>
  app.inject({
    method: 'POST',
    url: '/refresh',
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
  })

describe('POST /refresh', () => {
  beforeEach(async () => {
    await truncateAll()
  })

  it('rotates the refresh token into a fresh pair', async () => {
    const { body: registerBody } = await registerUser(app)
    const oldRefreshToken = registerBody.refreshToken

    const res = await refresh(oldRefreshToken)

    expect(res.statusCode).toBe(200)
    expect(res.json().accessToken).toEqual(expect.any(String))
    expect(res.json().refreshToken).toEqual(expect.any(String))

    const replayRes = await refresh(oldRefreshToken)
    expect(replayRes.statusCode).toBe(401)
    expect(replayRes.json().code).toBe('INVALID_REFRESH_TOKEN')
  })

  it('returns 401 INVALID_REFRESH_TOKEN for a random token', async () => {
    const res = await refresh('not-a-real-token')

    expect(res.statusCode).toBe(401)
    expect(res.json().code).toBe('INVALID_REFRESH_TOKEN')
  })

  it('invalidates the previous access token on rotation', async () => {
    const { body: registerBody } = await registerUser(app)
    const oldAccessToken = registerBody.accessToken

    const res = await refresh(registerBody.refreshToken)
    expect(res.statusCode).toBe(200)

    const meRes = await app.inject({
      method: 'GET',
      url: '/me',
      headers: { authorization: `Bearer ${oldAccessToken}` },
    })

    expect(meRes.statusCode).toBe(401)
  })

  it('returns 401 INVALID_REFRESH_TOKEN for an expired stored token', async () => {
    const { body: registerBody } = await registerUser(app)
    const refreshToken = registerBody.refreshToken

    await testDb
      .update(tokens)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(
        and(
          eq(tokens.tokenHash, hashToken(refreshToken)),
          eq(tokens.type, 'refresh'),
        ),
      )

    const res = await refresh(refreshToken)

    expect(res.statusCode).toBe(401)
    expect(res.json().code).toBe('INVALID_REFRESH_TOKEN')
  })

  it('returns 401 INVALID_REFRESH_TOKEN without an Authorization header', async () => {
    const res = await refresh()

    expect(res.statusCode).toBe(401)
    expect(res.json().code).toBe('INVALID_REFRESH_TOKEN')
  })
})
