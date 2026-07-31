import { buildTestApp } from '@test/helpers/app'
import { registerUser } from '@test/helpers/auth/register-user'
import { truncateAll } from '@test/helpers/db'
import { beforeEach, describe, expect, it } from 'vitest'

const app = buildTestApp()

describe('POST /logout', () => {
  beforeEach(async () => {
    await truncateAll()
  })

  it('returns success and revokes the refresh token', async () => {
    const { body } = await registerUser(app)
    const { accessToken, refreshToken } = body

    const res = await app.inject({
      method: 'POST',
      url: '/logout',
      headers: { authorization: `Bearer ${accessToken}` },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ success: true })

    const refreshRes = await app.inject({
      method: 'POST',
      url: '/refresh',
      headers: { authorization: `Bearer ${refreshToken}` },
    })

    expect(refreshRes.statusCode).toBe(401)
    expect(refreshRes.json().code).toBe('INVALID_REFRESH_TOKEN')
  })

  it('returns 401 without an access token', async () => {
    const res = await app.inject({ method: 'POST', url: '/logout' })

    expect(res.statusCode).toBe(401)
  })
})
