import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { hashToken } from './hash'

describe('hashToken', () => {
  it('produces a deterministic sha-256 hex digest', () => {
    expect(hashToken('a-secret')).toBe(
      createHash('sha256').update('a-secret').digest('hex'),
    )
  })

  it('never returns the raw token', () => {
    const token = 'raw-refresh-token'
    expect(hashToken(token)).not.toBe(token)
  })

  it('produces different hashes for different tokens', () => {
    expect(hashToken('token-a')).not.toBe(hashToken('token-b'))
  })
})
