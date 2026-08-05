import { Strategy } from '@fastify/passport/dist/strategies'
import type { FastifyRequest } from 'fastify'
import type { Profile as GoogleProfile } from 'passport-google-oauth20'
import {
  consumeOAuthState,
  storeOAuthState,
} from '@/db/repositories/oauth-states-repository'

type GoogleVerifyDone = (
  err?: unknown,
  user?: object | false,
  info?: object,
) => void

type GoogleVerify = (
  accessToken: string,
  refreshToken: string,
  profile: GoogleProfile,
  done: GoogleVerifyDone,
) => void

/**
 * Stands in for the production Google strategy, cutting out every network hop:
 * no state round-trip through Google, no token exchange, no profile fetch.
 *
 * What it keeps real:
 *  - the state dance goes through the actual `oauth_states` repository, so
 *    anti-CSRF and single-use semantics are exercised end to end;
 *  - verification is the production `googleVerify` (identity resolution,
 *    email_verified gate), fed with a canned profile.
 *
 * passport-oauth2 dispatches on method arity, so `authenticate` must keep its
 * exact signature; the rest of the passport surface (success/fail/error/
 * redirect) is provided by @fastify/passport on a prototype clone.
 */
export class FakeGoogleStrategy extends Strategy {
  constructor(
    private readonly profile: GoogleProfile,
    private readonly verify: GoogleVerify,
  ) {
    super('google')
  }

  authenticate(request: FastifyRequest): void {
    const query = request.query as { code?: string; state?: string } | undefined
    const code = query?.code

    if (!code) {
      // Start route: persist a state and bounce to a fake Google endpoint that
      // echoes it back (as Google would).
      void storeOAuthState().then((state) => {
        this.redirect(
          `http://fake-google/oauth2/v3/auth?client_id=test-client-id&state=${encodeURIComponent(state)}`,
        )
      })
      return
    }

    // Callback route: verify the state the way the real strategy would, then
    // hand the canned profile to the production verify.
    const state = query?.state ?? ''
    void consumeOAuthState(state).then((ok) => {
      if (!ok) {
        return this.fail('invalid state', 403)
      }

      this.verify(
        'fake-access-token',
        'fake-refresh-token',
        this.profile,
        (err, user, info) => {
          if (err) {
            return this.error(err as Error)
          }
          if (!user) {
            return this.fail(info as object)
          }
          this.success(user, info)
        },
      )
    })
  }
}
