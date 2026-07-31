import type { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'
import type { TokenPayload } from '@/utils/auth'
import { UnauthorizedError } from '../routes/_errors/errors/unauthorized-error'

// Recovers the raw token from `Authorization: Bearer <token>`. Returns null
// when the header is missing or malformed.
const extractBearerToken = (authorization: string | undefined) => {
  if (!authorization?.startsWith('Bearer ')) {
    return null
  }

  return authorization.slice('Bearer '.length)
}

// Access and refresh tokens are distinct credentials with distinct rules, so
// they get separate helpers. getCurrentUserId reads the short-lived access
// token; validateRefreshToken checks the long-lived refresh token and returns
// its raw value so callers can hash it (the DB stores only the hash).
export const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.addHook('preHandler', async (request) => {
    request.getCurrentUserId = async () => {
      try {
        const { sub } = await request.jwtVerify<TokenPayload>()

        return sub
      } catch {
        throw new UnauthorizedError('Invalid token')
      }
    }

    request.validateRefreshToken = async () => {
      try {
        const token = extractBearerToken(request.headers.authorization)

        if (!token) throw new Error('Missing Bearer token')

        await request.refreshJwtVerify()

        return token
      } catch {
        throw new UnauthorizedError(
          'Invalid refresh token',
          'INVALID_REFRESH_TOKEN',
        )
      }
    }
  })
})
