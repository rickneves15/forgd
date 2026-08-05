import { Authenticator } from '@fastify/passport'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'
import {
  type Profile as GoogleProfile,
  Strategy as GoogleStrategy,
} from 'passport-google-oauth20'
import { env } from '@/env'
import { UnauthorizedError } from '@/http/_errors/errors/unauthorized-error'
import { createOneTimeCode } from '@/lib/auth/google/one-time-code'
import { normalizeGoogleProfile } from '@/lib/auth/google/profile'
import type { ResolveGoogleIdentityResult } from '@/schemas'
import { resolveGoogleIdentity } from '@/services/auth/google/identity'
import { GoogleOAuthStateStore } from '@/services/auth/google/state-store'
import { issueTokenPair } from '@/services/auth/token-pair'

type GoogleVerifyDone = (
  err?: unknown,
  user?: object | false,
  info?: object,
) => void

// The strategy's verify: turns a fetched profile into an authenticated user.
// Exported so tests can drive the same logic through a network-free fake
// strategy (see test/helpers/auth/fake-google-strategy.ts).
export const googleVerify = async (
  _accessToken: string,
  _refreshToken: string,
  profile: GoogleProfile,
  done: GoogleVerifyDone,
) => {
  const normalized = normalizeGoogleProfile(profile)

  // Google's signed id_token claim gates account creation: an unverified email
  // is rejected here, never silently promoted.
  if (!normalized.emailVerified) {
    return done(null, false, { message: 'Unverified Google email' })
  }

  try {
    return done(null, await resolveGoogleIdentity(normalized))
  } catch (err) {
    return done(err as Error)
  }
}

// One Authenticator, Google only. The OAuth dance's state lives in the DB
// (GoogleOAuthStateStore) instead of a session/cookie, so the API stays
// sessionless between requests — `session: false` below.
//
// `userProperty` avoids @fastify/jwt, which already decorates request.user.
// The strategy's user is passed to the callback directly, never read off the
// request, so the name is purely about not clashing decorators.
//
// Exported so tests can swap in a fake strategy that skips the network.
export const googlePassport = new Authenticator({
  userProperty: 'passportUser',
})

googlePassport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${env.API_PUBLIC_URL}/auth/oauth/google/callback`,
      scope: ['openid', 'email', 'profile'],
      store: new GoogleOAuthStateStore(),
    },
    googleVerify,
  ),
)

const onGoogleAuthenticated = async (
  _request: FastifyRequest,
  reply: FastifyReply,
  err: null | Error,
  user?: unknown,
) => {
  // Any Google-side rejection (denied consent, bad/exhausted state, unverified
  // email, profile fetch failure) collapses to a single 401 — clients just
  // retry the whole dance. No internal detail leaks through the redirect.
  if (err || !user) {
    throw new UnauthorizedError(
      'Google authentication failed',
      'INVALID_GOOGLE_TOKEN',
    )
  }

  const { user: resolvedUser, isNewUser } = user as ResolveGoogleIdentityResult
  const { accessToken, refreshToken } = await issueTokenPair(reply, {
    userId: resolvedUser.id,
  })

  // The token pair can't live in the redirect URL, so it's stashed behind a
  // 60s single-use code that the app redeems at POST /auth/oauth/exchange.
  const code = createOneTimeCode({
    accessToken,
    refreshToken,
    user: resolvedUser,
    isNewUser,
  })

  return reply.redirect(`${env.GOOGLE_MOBILE_REDIRECT_URI}?code=${code}`)
}

// Applied as `preValidation` on both Google routes. On `/auth/oauth/google` it
// redirects to Google; on `/auth/oauth/google/callback` it exchanges the code,
// resolves the identity and redirects to the deep link.
export const googleAuth = googlePassport.authenticate(
  'google',
  { session: false },
  onGoogleAuthenticated,
)

// fastify-plugin: the `passport` request decorator must be visible on the
// root scope, so this cannot be an encapsulated plugin.
//
// This is a hand-rolled version of Authenticator#initialize(): the stock one
// also registers @fastify/flash, which requires a request.session decorator
// (i.e. a cookie session) — exactly what the design excludes. The Google flow
// only needs `request.passport`; login/logout and flash are never reached
// because `session: false` plus a custom callback means the strategy result
// goes straight to the callback.
export const googleOAuth = fastifyPlugin(async (app: FastifyInstance) => {
  app.decorateRequest('passport', {
    getter() {
      return googlePassport
    },
  })
})
