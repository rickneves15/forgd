import { makeGoogleProfile } from '@test/factories/auth/google'
import { makeUserPayload } from '@test/factories/auth/user'
import { buildTestApp } from '@test/helpers/app'
import { FakeGoogleStrategy } from '@test/helpers/auth/fake-google-strategy'
import { registerUser } from '@test/helpers/auth/register-user'
import { truncateAll } from '@test/helpers/db'
import type { Profile as GoogleProfile } from 'passport-google-oauth20'
import { beforeEach, describe, expect, it } from 'vitest'
import { googlePassport, googleVerify } from '@/http/plugins/oauth/google'

const app = buildTestApp()

// Reads a query param from a redirect Location, failing the test if the
// header is missing (the routes under test always redirect).
const paramFromRedirect = (
  res: { headers: { location?: string } },
  param: string,
): string => {
  const location = res.headers.location
  if (!location) throw new Error('expected a redirect Location header')
  return new URL(location).searchParams.get(param) ?? ''
}

// Points the Google strategy at a fake that skips the network. The fake feeds
// the production `googleVerify`, so identity resolution and the email gate
// run exactly as in production.
const useGoogleProfile = (profile: GoogleProfile = makeGoogleProfile()) => {
  googlePassport.unuse('google')
  googlePassport.use(new FakeGoogleStrategy(profile, googleVerify))
}

// Runs the whole mobile dance: start → Google redirect (fake) → callback →
// deep link with one-time code → exchange. Returns the exchange response.
const completeGoogleDance = async (profile: GoogleProfile) => {
  useGoogleProfile(profile)

  const start = await app.inject({ method: 'GET', url: '/auth/oauth/google' })
  expect(start.statusCode).toBe(302)
  const state = paramFromRedirect(start, 'state')
  expect(state).toBeTruthy()

  const callback = await app.inject({
    method: 'GET',
    url: `/auth/oauth/google/callback?code=test-code&state=${state}`,
  })
  expect(callback.statusCode).toBe(302)

  const code = paramFromRedirect(callback, 'code')
  expect(code).toBeTruthy()

  return app.inject({
    method: 'POST',
    url: '/auth/oauth/exchange',
    payload: { code },
  })
}

describe('Google OAuth flow', () => {
  beforeEach(async () => {
    await truncateAll()
  })

  it('redirects to Google with a state param on the start route', async () => {
    useGoogleProfile()

    const res = await app.inject({ method: 'GET', url: '/auth/oauth/google' })

    expect(res.statusCode).toBe(302)
    const location = res.headers.location
    if (!location) throw new Error('expected a redirect Location header')
    expect(new URL(location).hostname).toBe('fake-google')
    expect(new URL(location).searchParams.get('state')).toBeTruthy()
    expect(new URL(location).searchParams.get('client_id')).toBe(
      'test-client-id',
    )
  })

  it('creates a new user and returns tokens on first login', async () => {
    const profile = makeGoogleProfile({ email: 'joao.silva@gmail.com' })

    const res = await completeGoogleDance(profile)

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.accessToken).toEqual(expect.any(String))
    expect(body.refreshToken).toEqual(expect.any(String))
    expect(body.isNewUser).toBe(true)
    expect(body.user).toMatchObject({
      // Base is the email local part, normalized.
      username: 'joaosilva',
      email: 'joao.silva@gmail.com',
      college: null,
    })
  })

  it('returns isNewUser false and the same account for a repeat login', async () => {
    const profile = makeGoogleProfile()

    const first = await completeGoogleDance(profile)
    expect(first.json().isNewUser).toBe(true)

    const second = await completeGoogleDance(profile)
    expect(second.statusCode).toBe(200)
    expect(second.json().isNewUser).toBe(false)
    expect(second.json().user.id).toBe(first.json().user.id)
  })

  it('auto-links to an existing account with the same email', async () => {
    const profile = makeGoogleProfile()
    const existing = makeUserPayload({ email: profile.emails?.[0].value })
    const { body: registered } = await registerUser(app, existing)

    const res = await completeGoogleDance(profile)

    expect(res.statusCode).toBe(200)
    expect(res.json().isNewUser).toBe(false)
    expect(res.json().user.id).toBe(registered.user.id)
  })

  it('rejects a callback whose state was already consumed', async () => {
    useGoogleProfile()
    const start = await app.inject({ method: 'GET', url: '/auth/oauth/google' })
    const state = paramFromRedirect(start, 'state')

    const first = await app.inject({
      method: 'GET',
      url: `/auth/oauth/google/callback?code=test-code&state=${state}`,
    })
    expect(first.statusCode).toBe(302)

    const replay = await app.inject({
      method: 'GET',
      url: `/auth/oauth/google/callback?code=test-code&state=${state}`,
    })

    expect(replay.statusCode).toBe(401)
    expect(replay.json()).toEqual({
      code: 'INVALID_GOOGLE_TOKEN',
      message: 'Google authentication failed',
    })
  })

  it('rejects a callback with an unknown state', async () => {
    useGoogleProfile()

    const res = await app.inject({
      method: 'GET',
      url: '/auth/oauth/google/callback?code=test-code&state=never-issued',
    })

    expect(res.statusCode).toBe(401)
    expect(res.json().code).toBe('INVALID_GOOGLE_TOKEN')
  })

  it('rejects an unverified email with the same 401', async () => {
    const profile = makeGoogleProfile({ emailVerified: false })
    useGoogleProfile(profile)

    const start = await app.inject({ method: 'GET', url: '/auth/oauth/google' })
    const state = paramFromRedirect(start, 'state')

    const callback = await app.inject({
      method: 'GET',
      url: `/auth/oauth/google/callback?code=test-code&state=${state}`,
    })

    expect(callback.statusCode).toBe(401)
    expect(callback.json().code).toBe('INVALID_GOOGLE_TOKEN')
  })

  it('issues an access token that works on authenticated routes', async () => {
    const res = await completeGoogleDance(makeGoogleProfile())

    const me = await app.inject({
      method: 'GET',
      url: '/me',
      headers: { authorization: `Bearer ${res.json().accessToken}` },
    })

    expect(me.statusCode).toBe(200)
    expect(me.json().userId).toBe(res.json().user.id)
  })

  it('rejects an exchange with a missing code', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/oauth/exchange',
      payload: {},
    })

    expect(res.statusCode).toBe(400)
    expect(res.json().code).toBe('VALIDATION_ERROR')
  })
})
