import fastifyCors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import fastifyThrottle from '@fastify/throttle'
import type { FastifyInstance } from 'fastify'
import { fastifyPlugin } from 'fastify-plugin'

// fastify-plugin: helmet's headers and the rate-limit/throttle hooks must
// apply to every route in the app, so they can't be scoped to a child context.
export const security = fastifyPlugin(async (app: FastifyInstance) => {
  // Security headers (helmet). CSP is disabled on purpose: the only HTML the
  // API serves is the Scalar /docs page, which needs inline scripts/styles.
  app.register(helmet, { contentSecurityPolicy: false })

  app.register(fastifyCors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  })

  // Light global rate limit with the built-in in-memory store. Per-route
  // hardening (e.g. login brute-force) and a Redis store are deferred.
  app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  })

  // Global response-send throttle as an abuse guard. Generous enough to never
  // slow down legitimate payloads (the largest is the /docs bundle).
  app.register(fastifyThrottle, {
    bytesPerSecond: 5 * 1024 * 1024,
  })
})
