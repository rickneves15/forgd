import type { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'
import type { TokenPayload } from '@/utils/auth'
import { UnauthorizedError } from '../routes/_errors/errors/unauthorized-error'

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
  })
})
