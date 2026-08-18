import { buildTestApp } from '@test/helpers/app'
import { registerUser } from '@test/helpers/auth/register-user'
import { truncateAll } from '@test/helpers/db'
import { beforeEach, describe, expect, it } from 'vitest'

const app = buildTestApp()

describe('GET /me', () => {
  beforeEach(async () => {
    await truncateAll()
  })

  it('returns the current user id', async () => {
    const { body: registerBody } = await registerUser(app)

    const res = await app.inject({
      method: 'GET',
      url: '/me',
      headers: { authorization: `Bearer ${registerBody.accessToken}` },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ userId: registerBody.user.id })
  })

  it('returns 401 without an access token', async () => {
    const res = await app.inject({ method: 'GET', url: '/me' })

    expect(res.statusCode).toBe(401)
  })
})
