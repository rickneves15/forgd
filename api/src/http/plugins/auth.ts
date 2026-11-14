import fastifyAuth from '@fastify/auth'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'
import {
  verifyAccessToken,
  verifyRefreshToken,
} from '@/services/auth/token-pair'

// fastify-plugin: the decorated strategies (app.verifyAccessToken,
// app.verifyRefreshToken) and app.auth must be visible to every route, so
// they are registered on the root scope, not an encapsulated one.
//
// Each strategy is a thin wrapper over the token module: JWT verification,
// the tokens-table revocation check, and expiry all live in token-pair.ts.
export const auth = fastifyPlugin(async (app: FastifyInstance) => {
  app.register(fastifyAuth)

  app.decorate('verifyAccessToken', async (request: FastifyRequest) => {
    request.userId = await verifyAccessToken(request)
  })

  app.decorate('verifyRefreshToken', async (request: FastifyRequest) => {
    request.userId = await verifyRefreshToken(request)
  })
})
