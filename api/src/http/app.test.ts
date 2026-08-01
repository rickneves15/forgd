import { buildTestApp } from '@test/helpers/app'
import { describe, expect, it } from 'vitest'

describe('404 handler', () => {
  const app = buildTestApp()

  it('returns the standardized NOT_FOUND body for unknown routes', async () => {
    const res = await app.inject({ method: 'GET', url: '/nonexistent-route' })

    expect(res.statusCode).toBe(404)
    expect(res.json()).toEqual({
      code: 'NOT_FOUND',
      message: 'Route not found',
    })
  })
})
