import { buildTestApp } from '@test/helpers/app'
import { describe, expect, it } from 'vitest'

describe('GET /health', () => {
  const app = buildTestApp()

  it('returns 200 with database ok when Postgres responds', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ status: 'ok', database: 'ok' })
  })
})
