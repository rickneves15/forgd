import { afterAll, beforeAll } from 'vitest'
import { closeDb } from '@/db'
import { buildApp } from '@/http/app'

// Builds the full app (all plugins + routes), readies it, and guarantees the
// fastify instance is closed when the test file finishes.
export const buildTestApp = () => {
  const app = buildApp({ logger: false })

  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
    await closeDb()
  })

  return app
}
