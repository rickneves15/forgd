import { generateKeyPairSync } from 'node:crypto'

export const TEST_DATABASE_URL =
  'postgres://postgres:postgres@localhost:5432/forgd_test'

// src/env.ts requires all four JWT keys as strings (z.string()), so the PEM
// exports are explicitly converted and typed as strings.
const generateRsaKeyPair = (): {
  privateKey: string
  publicKey: string
} => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
  })

  return {
    privateKey: privateKey.export({ type: 'pkcs1', format: 'pem' }).toString(),
    publicKey: publicKey.export({ type: 'spki', format: 'pem' }).toString(),
  }
}

// Sets every env var the app parses at import time (src/env.ts). Runs before
// any test module loads, so the `env` singleton and `@/db` already see the
// test database and freshly generated RSA key pairs.
export const setTestEnv = () => {
  const access = generateRsaKeyPair()
  const refresh = generateRsaKeyPair()

  process.env.NODE_ENV = 'test'
  process.env.LOG_LEVEL = 'silent'
  process.env.DATABASE_URL = TEST_DATABASE_URL
  process.env.JWT_PRIVATE_KEY = access.privateKey
  process.env.JWT_PUBLIC_KEY = access.publicKey
  process.env.REFRESH_JWT_PRIVATE_KEY = refresh.privateKey
  process.env.REFRESH_JWT_PUBLIC_KEY = refresh.publicKey
  process.env.GOOGLE_CLIENT_ID = 'test-client-id'
  process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret'
  process.env.GOOGLE_MOBILE_REDIRECT_URI = 'forgd://auth-callback'
  process.env.API_PUBLIC_URL = 'http://localhost:3333'
}
