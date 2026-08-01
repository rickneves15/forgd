import 'fastify'
import type fastifyAuth from '@fastify/auth'

declare module 'fastify' {
  export interface FastifyReply {
    refreshJwtSign(payload: { sub: string; jti?: string }): Promise<string>
  }

  export interface FastifyRequest {
    refreshJwtVerify(): Promise<void>
    // Set by the verifyAccessToken strategy (@fastify/auth preHandler) —
    // guaranteed present in handlers guarded by it.
    userId: string
    // Set by the verifyRefreshToken strategy — the raw presented token, so
    // callers can hash it for the DB lookup.
    rawRefreshToken: string
  }

  export interface FastifyInstance {
    verifyAccessToken: fastifyAuth.FastifyAuthFunction
    verifyRefreshToken: fastifyAuth.FastifyAuthFunction
  }
}
