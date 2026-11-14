import type { FastifyReply } from 'fastify'
import { env } from '@/env'
import { createOneTimeCode } from '@/lib/auth/google/one-time-code'
import type { ResolveGoogleIdentityResult } from '@/schemas/auth/google'
import { issueTokenPair } from '@/services/auth/token-pair'

// Turns a resolved Google identity into the mobile deep-link URL that carries
// the token pair behind a single-use 60s one-time code. The plugin layer
// (google.ts) owns the redirect; this module owns the outcome logic:
//
//   resolved user -> token pair -> one-time code -> deep link url
//
// Returns the URL string so the caller decides how to send it (reply.redirect,
// a test assertion, ...). The caller guarantees `resolvedUser` is present.
export const googleOutcome = async (
  reply: FastifyReply,
  resolvedUser: ResolveGoogleIdentityResult,
): Promise<string> => {
  const { accessToken, refreshToken } = await issueTokenPair(reply, {
    userId: resolvedUser.user.id,
  })

  // The token pair can't live in the redirect URL, so it's stashed behind a
  // 60s single-use code that the app redeems at POST /auth/oauth/exchange.
  const code = createOneTimeCode({
    accessToken,
    refreshToken,
    user: resolvedUser.user,
    isNewUser: resolvedUser.isNewUser,
  })

  return `${env.GOOGLE_MOBILE_REDIRECT_URI}?code=${code}`
}
