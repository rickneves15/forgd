import type { FastifyInstance } from 'fastify'
import { makeUserPayload, type UserPayloadOverrides } from './user-factory'

// Registers a user through the real endpoint and returns both the raw
// response and its parsed body, so tests can assert on status/codes or reuse
// the returned tokens. Data comes from makeUserPayload (faker); `overrides`
// lets a test change just the fields it needs.
export const registerUser = async (
  app: FastifyInstance,
  overrides: UserPayloadOverrides = {},
) => {
  const payload = makeUserPayload(overrides)

  const res = await app.inject({
    method: 'POST',
    url: '/register',
    payload,
  })

  return { res, body: res.json() }
}
