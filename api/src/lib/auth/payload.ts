import { REFRESH_TOKEN_TTL_MS } from '@/constants'

export type TokenPayload = {
  sub: string
}

export type TokenPayloadRequest = {
  userId: string
}

export const createTokenPayload = (
  data: TokenPayloadRequest,
): TokenPayload => ({
  sub: data.userId,
})

export const getRefreshTokenExpirationDate = () => {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_MS) // 30 days
}
