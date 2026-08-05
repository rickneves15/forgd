import { generateUUID } from '@/lib/uuid'
import type { OauthSuccess } from '@/schemas'

const ONE_TIME_CODE_TTL_MS = 60_000

// In-memory because the code lives for 60s on a single API instance; the
// payload (the same shape as the /auth/oauth/exchange 200 response) travels
// through the deep link and is redeemed once.
const store = new Map<string, { payload: OauthSuccess; expiresAt: number }>()

export const createOneTimeCode = (payload: OauthSuccess): string => {
  const code = generateUUID()
  store.set(code, { payload, expiresAt: Date.now() + ONE_TIME_CODE_TTL_MS })
  return code
}

// Single-use: the code is deleted on first consumption, so a replayed deep
// link can never redeem twice. Expired codes return null.
export const consumeOneTimeCode = (code: string): OauthSuccess | null => {
  const entry = store.get(code)
  if (!entry) {
    return null
  }
  store.delete(code)
  return entry.expiresAt > Date.now() ? entry.payload : null
}

// Test hook — resets the in-memory store between tests.
export const clearOneTimeCodes = (): void => {
  store.clear()
}
