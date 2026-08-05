import { faker } from '@faker-js/faker'
import { makeUserPayload } from '@test/factories/auth/user'
import { buildTestApp } from '@test/helpers/app'
import { registerUser } from '@test/helpers/auth/register-user'
import { truncateAll } from '@test/helpers/db'
import { beforeEach, describe, expect, it } from 'vitest'

const app = buildTestApp()

describe('POST /login', () => {
  let credentials: { email: string; password: string }

  beforeEach(async () => {
    await truncateAll()

    const payload = makeUserPayload()
    await registerUser(app, payload)

    credentials = { email: payload.email, password: payload.password }
  })

  it('returns 200 with tokens and user on valid credentials', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/login',
      payload: credentials,
    })

    expect(res.statusCode).toBe(200)
    expect(res.json().accessToken).toEqual(expect.any(String))
    expect(res.json().refreshToken).toEqual(expect.any(String))
    expect(res.json().user).toMatchObject({
      id: expect.any(String),
      username: expect.any(String),
      email: credentials.email,
    })
  })

  it('returns 401 INVALID_CREDENTIALS on a wrong password', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/login',
      payload: {
        email: credentials.email,
        password: faker.internet.password({ length: 12 }),
      },
    })

    expect(res.statusCode).toBe(401)
    expect(res.json()).toEqual({
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid credentials',
    })
  })

  it('returns an identical 401 for an unknown email', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/login',
      payload: {
        email: faker.internet.email(),
        password: credentials.password,
      },
    })

    expect(res.statusCode).toBe(401)
    expect(res.json()).toEqual({
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid credentials',
    })
  })

  it('returns 400 VALIDATION_ERROR on missing fields', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/login',
      payload: { email: credentials.email },
    })

    expect(res.statusCode).toBe(400)
    expect(res.json().code).toBe('VALIDATION_ERROR')
  })
})
