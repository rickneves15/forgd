import 'fastify'
import type fastifyAuth from '@fastify/auth'

declare module 'fastify' {
  export interface FastifyReply {
    refreshJwtSign(payload: { sub: string; jti?: string }): Promise<string>
  }

  export interface FastifyRequest {
    refreshJwtVerify(): Promise<void>
    // Set by the verifyAccessToken / verifyRefreshToken strategies
    // (@fastify/auth preHandler) — guaranteed present in handlers guarded by
    // either one.
    userId: string
  }

  export interface FastifyInstance {
    verifyAccessToken: fastifyAuth.FastifyAuthFunction
    verifyRefreshToken: fastifyAuth.FastifyAuthFunction
  }
}
