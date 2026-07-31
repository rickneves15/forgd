import 'fastify'

declare module 'fastify' {
  export interface FastifyReply {
    refreshJwtSign(payload: { sub: string; jti?: string }): Promise<string>
  }

  export interface FastifyRequest {
    getCurrentUserId(): Promise<string>
    refreshJwtVerify(): Promise<void>
  }
}
