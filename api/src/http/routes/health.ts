import { sql } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '@/db'

export const health: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/health',
    {
      // Railway probes this endpoint every few seconds; it must never trip
      // the global rate limit (see ADR-005).
      config: { rateLimit: false },
      schema: {
        summary: "Reports the API's health, including a Postgres ping.",
        tags: ['System'],
        response: {
          200: z.object({
            status: z.literal('ok'),
            database: z.literal('ok'),
          }),
          503: z.object({
            status: z.literal('degraded'),
            database: z.literal('down'),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        await db.execute(sql`SELECT 1`)

        return { status: 'ok', database: 'ok' } as const
      } catch (error) {
        request.log.error({ err: error }, 'Health check: database ping failed')

        return reply.status(503).send({
          status: 'degraded',
          database: 'down',
        })
      }
    },
  )
}
