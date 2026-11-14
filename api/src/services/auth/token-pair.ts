import type { FastifyReply, FastifyRequest } from 'fastify'
import { ACCESS_TOKEN_TTL_MS } from '@/constants'
import {
  deleteAllTokensByUserId,
  findTokenByHashAndType,
  insertToken,
} from '@/db/repositories/tokens-repository'
import { UnauthorizedError } from '@/http/_errors/errors/unauthorized-error'
import { hashToken } from '@/lib/auth/hash'
import {
  createTokenPayload,
  getRefreshTokenExpirationDate,
} from '@/lib/auth/payload'
import { generateUUID } from '@/lib/uuid'
import type { TokenPayloadRequest } from '@/schemas'

// Signs a fresh access + refresh pair and persists both hashes so rotation and
// revocation have a record to check. Used by the register, login and refresh
// routes. The DB row is the revocation record for both token types: delete it
// and the JWT stops being accepted, even before it expires.
//
// Lives in `services` because it signs through the Fastify reply (jwtSign).
export const issueTokenPair = async (
  reply: FastifyReply,
  data: TokenPayloadRequest,
) => {
  const payload = createTokenPayload(data)

  // A unique jti per token makes rotation work: without it, two access or
  // refresh tokens signed in the same second are byte-identical (same
  // sub/iat/exp), so a "new" token is indistinguishable from the old one it
  // replaces.
  const accessToken = await reply.jwtSign({
    ...payload,
    jti: generateUUID(),
  })
  const refreshToken = await reply.refreshJwtSign({
    ...payload,
    jti: generateUUID(),
  })

  await insertToken({
    userId: data.userId,
    type: 'access',
    tokenHash: hashToken(accessToken),
    expiresAt: new Date(Date.now() + ACCESS_TOKEN_TTL_MS),
  })
  await insertToken({
    userId: data.userId,
    type: 'refresh',
    tokenHash: hashToken(refreshToken),
    expiresAt: getRefreshTokenExpirationDate(),
  })

  return {
    accessToken,
    refreshToken,
  }
}

// Extracts the raw token from `Authorization: Bearer <token>`. Returns null
// when the header is missing or malformed.
const extractBearerToken = (
  authorization: string | undefined,
): string | null => {
  if (!authorization?.startsWith('Bearer ')) {
    return null
  }
  return authorization.slice('Bearer '.length)
}

// Verifies an access token: JWT signature, then the tokens table (the
// revocation record), then expiry. Returns the user id on success.
// Throws UnauthorizedError on any failure — callers are thin pass-throughs.
export const verifyAccessToken = async (
  request: FastifyRequest,
): Promise<string> => {
  try {
    const { sub } = await request.jwtVerify<{ sub: string }>()

    const token = extractBearerToken(request.headers.authorization)
    const storedToken = token
      ? await findTokenByHashAndType(hashToken(token), 'access')
      : null

    if (!token || !storedToken || storedToken.expiresAt < new Date()) {
      throw new Error('Invalid access token')
    }

    return sub
  } catch {
    throw new UnauthorizedError('Invalid token')
  }
}

// Verifies a refresh token: JWT signature, then the tokens table (the
// revocation record), then expiry. Returns the user id on success.
// Throws UnauthorizedError on any failure — callers are thin pass-throughs.
export const verifyRefreshToken = async (
  request: FastifyRequest,
): Promise<string> => {
  try {
    const token = extractBearerToken(request.headers.authorization)
    if (!token) throw new Error('Missing Bearer token')

    await request.refreshJwtVerify()

    const storedToken = await findTokenByHashAndType(
      hashToken(token),
      'refresh',
    )

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new Error('Invalid refresh token')
    }

    return storedToken.userId
  } catch {
    throw new UnauthorizedError(
      'Invalid refresh token',
      'INVALID_REFRESH_TOKEN',
    )
  }
}

// Rotation: revoke every token the user holds — the presented refresh token
// and all outstanding access tokens — then issue a fresh pair. A leaked old
// pair can't be replayed after the legitimate client has refreshed.
export const rotateTokens = async (reply: FastifyReply, userId: string) => {
  await revokeTokens(userId)
  return issueTokenPair(reply, { userId })
}

// Revokes every token (access + refresh) a user holds. Used by logout and by
// rotation. After this, none of the user's JWTs are accepted.
export const revokeTokens = async (userId: string): Promise<void> => {
  await deleteAllTokensByUserId(userId)
}
