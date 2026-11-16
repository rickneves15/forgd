import { buildTestApp } from '@test/helpers/app'
import { registerUser } from '@test/helpers/auth/register-user'
import { truncateAll } from '@test/helpers/db'
import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '@/db'
import { users } from '@/db/schema'

const app = buildTestApp()

describe('PUT /users/me/interests', () => {
  beforeEach(async () => {
    await truncateAll()
  })

  it('saves valid tags and returns them', async () => {
    const { body: registerBody } = await registerUser(app)

    const res = await app.inject({
      method: 'PUT',
      url: '/users/me/interests',
      headers: { authorization: `Bearer ${registerBody.accessToken}` },
      payload: { interests: ['ente', 'mechanical'] },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ interests: ['ente', 'mechanical'] })

    const [user] = await db
      .select({ interests: users.interests })
      .from(users)
      .where(eq(users.id, registerBody.user.id))

    expect(user.interests).toEqual(['ente', 'mechanical'])
  })

  it('allows an empty array (skipping onboarding)', async () => {
    const { body: registerBody } = await registerUser(app)

    const res = await app.inject({
      method: 'PUT',
      url: '/users/me/interests',
      headers: { authorization: `Bearer ${registerBody.accessToken}` },
      payload: { interests: [] },
    })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ interests: [] })

    const [user] = await db
      .select({ interests: users.interests })
      .from(users)
      .where(eq(users.id, registerBody.user.id))

    expect(user.interests).toEqual([])
  })

  it('returns 400 VALIDATION_ERROR for an unknown tag', async () => {
    const { body: registerBody } = await registerUser(app)

    const res = await app.inject({
      method: 'PUT',
      url: '/users/me/interests',
      headers: { authorization: `Bearer ${registerBody.accessToken}` },
      payload: { interests: ['not-a-real-tag'] },
    })

    expect(res.statusCode).toBe(400)
    expect(res.json().code).toBe('VALIDATION_ERROR')
  })

  it('requires auth', async () => {
    const res = await app.inject({
      method: 'PUT',
      url: '/users/me/interests',
      payload: { interests: ['civil'] },
    })

    expect(res.statusCode).toBe(401)
  })
})
