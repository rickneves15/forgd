import { makeUserPayload } from '@test/factories/auth/user'
import { buildTestApp } from '@test/helpers/app'
import { registerUser } from '@test/helpers/auth/register-user'
import { testDb, truncateAll } from '@test/helpers/db'
import { compare } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '@/db'
import { users } from '@/db/schema'

const app = buildTestApp()

describe('POST /register', () => {
  beforeEach(async () => {
    await truncateAll()
  })

  it('returns 201 with tokens and user on valid payload', async () => {
    const { res, body } = await registerUser(app)

    expect(res.statusCode).toBe(201)
    expect(body.accessToken).toEqual(expect.any(String))
    expect(body.refreshToken).toEqual(expect.any(String))
    expect(body.user).toMatchObject({
      id: expect.any(String),
      username: expect.any(String),
      email: expect.any(String),
      college: null,
    })
  })

  it('persists the optional college field', async () => {
    const { res, body } = await registerUser(app, { college: 'MIT' })

    expect(res.statusCode).toBe(201)
    expect(body.user.college).toBe('MIT')
  })

  it('returns 409 EMAIL_TAKEN when the email already exists', async () => {
    const first = await registerUser(app)

    const { res, body } = await registerUser(app, {
      email: first.body.user.email,
    })

    expect(res.statusCode).toBe(409)
    expect(body).toEqual({
      code: 'EMAIL_TAKEN',
      message: 'Email already registered',
    })
  })

  it('returns 409 USERNAME_TAKEN when the username already exists', async () => {
    const first = await registerUser(app)

    const { res, body } = await registerUser(app, {
      username: first.body.user.username,
    })

    expect(res.statusCode).toBe(409)
    expect(body).toEqual({
      code: 'USERNAME_TAKEN',
      message: 'Username already taken',
    })
  })

  it('returns 400 VALIDATION_ERROR on a weak password', async () => {
    const { res, body } = await registerUser(app, { password: 'short' })

    expect(res.statusCode).toBe(400)
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 VALIDATION_ERROR on a malformed email', async () => {
    const { res } = await registerUser(app, { email: 'not-an-email' })

    expect(res.statusCode).toBe(400)
  })

  it('returns 400 BAD_REQUEST when the user insert fails', async () => {
    // The insert always returns a row on Postgres, so this defensive branch
    // needs a mock to make the INSERT...RETURNING come back empty.
    const insertSpy = vi.spyOn(db, 'insert').mockReturnValue({
      values: () => ({
        returning: () => [],
      }),
    } as unknown as ReturnType<typeof db.insert>)

    try {
      const { res, body } = await registerUser(app)

      expect(res.statusCode).toBe(400)
      expect(body).toEqual({
        code: 'BAD_REQUEST',
        message: 'Failed to create user',
      })
    } finally {
      insertSpy.mockRestore()
    }
  })

  it('never returns the password', async () => {
    const payload = makeUserPayload()

    const { res, body } = await registerUser(app, payload)

    expect(res.statusCode).toBe(201)
    expect(JSON.stringify(body)).not.toContain(payload.password)
  })

  it('stores the password only as a bcrypt hash', async () => {
    const payload = makeUserPayload()

    const { body } = await registerUser(app, payload)

    const [user] = await testDb
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.email, body.user.email))
      .limit(1)

    const passwordHash = user?.passwordHash ?? ''

    expect(passwordHash).not.toBe(payload.password)
    expect(await compare(payload.password, passwordHash)).toBe(true)
  })
})
