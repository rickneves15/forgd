import fastifyAuth from '@fastify/auth'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'
import { findTokenByHashAndType } from '@/db/repositories/tokens-repository'
import { UnauthorizedError } from '@/http/errors/unauthorized-error'
import { hashToken } from '@/lib/auth/hash'
import type { TokenPayload } from '@/lib/auth/payload'

// Recovers the raw token from `Authorization: Bearer <token>`. Returns null
// when the header is missing or malformed.
const extractBearerToken = (authorization: string | undefined) => {
  if (!authorization?.startsWith('Bearer ')) {
    return null
  }

  return authorization.slice('Bearer '.length)
}

// fastify-plugin: the decorated strategies (app.verifyAccessToken,
// app.verifyRefreshToken) and app.auth must be visible to every route, so
// they are registered on the root scope, not an encapsulated one.
export const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.register(fastifyAuth)

  // Access and refresh tokens are distinct credentials with distinct rules, so
  // they get separate strategies. Both require a matching non-expired row in
  // the tokens table: that row is the revocation record, so a rotated or
  // logged-out token stops being accepted immediately (SPEC-04).
  app.decorate('verifyAccessToken', async (request: FastifyRequest) => {
    try {
      const { sub } = await request.jwtVerify<TokenPayload>()

      const token = extractBearerToken(request.headers.authorization)
      const storedToken = token
        ? await findTokenByHashAndType(hashToken(token), 'access')
        : null

      if (!token || !storedToken || storedToken.expiresAt < new Date()) {
        throw new Error('Invalid access token')
      }

      request.userId = sub
    } catch {
      throw new UnauthorizedError('Invalid token')
    }
  })

  app.decorate('verifyRefreshToken', async (request: FastifyRequest) => {
    try {
      const token = extractBearerToken(request.headers.authorization)

      if (!token) throw new Error('Missing Bearer token')

      await request.refreshJwtVerify()

      request.rawRefreshToken = token
    } catch {
      throw new UnauthorizedError(
        'Invalid refresh token',
        'INVALID_REFRESH_TOKEN',
      )
    }
  })
})
