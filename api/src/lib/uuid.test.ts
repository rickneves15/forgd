import { validate as isUuid } from 'uuid'
import { describe, expect, it } from 'vitest'
import { generateUUID } from './uuid'

describe('generateUUID', () => {
  it('returns a unique valid uuid per call', () => {
    const first = generateUUID()
    const second = generateUUID()

    expect(isUuid(first)).toBe(true)
    expect(first).not.toBe(second)
  })
})
