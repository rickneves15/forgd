import { insertRefreshToken } from '@/db/repositories/refresh-tokens-repository'
import { generateUUID } from '@/lib/uuid'
import {
  createTokenPayload,
  getRefreshTokenExpirationDate,
  hashToken,
  type TokenPayload,
  type TokenPayloadRequest,
} from '@/utils/auth'

// The token-signing port consumed by the auth use-cases. The HTTP layer
// builds an implementation from Fastify's reply decorators (see
// src/http/token-signer.ts), keeping fastify-jwt out of the use-case layer.
export type TokenSigner = {
  signAccessToken: (payload: TokenPayload) => Promise<string>
  signRefreshToken: (payload: TokenPayload & { jti: string }) => Promise<string>
}

export const issueTokens = async (
  signer: TokenSigner,
  data: TokenPayloadRequest,
) => {
  const payload = createTokenPayload(data)

  const accessToken = await signer.signAccessToken(payload)
  // A unique jti per refresh token makes rotation (SPEC-04) work: without it,
  // two tokens signed in the same second are byte-identical (same sub/iat/exp).
  const refreshToken = await signer.signRefreshToken({
    ...payload,
    jti: generateUUID(),
  })

  await insertRefreshToken({
    userId: data.userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: getRefreshTokenExpirationDate(),
  })

  return {
    accessToken,
    refreshToken,
  }
}
