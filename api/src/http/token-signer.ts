import type { FastifyReply } from 'fastify'
import type { TokenSigner } from '@/use-cases/auth/issue-tokens'

// Builds the token-signing port the auth use-cases consume, from Fastify's
// reply decorators. The use-case layer never touches `reply` or fastify-jwt
// directly — it only sees two plain signing functions (ADR-005).
export const createTokenSigner = (reply: FastifyReply): TokenSigner => ({
  signAccessToken: (payload) => reply.jwtSign(payload),
  signRefreshToken: (payload) => reply.refreshJwtSign(payload),
})
