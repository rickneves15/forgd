import { createHash } from 'node:crypto'

// Tokens are stored only as a SHA-256 hash — the revocation record is the
// row's existence, never the raw JWT.
export const hashToken = (token: string) => {
  return createHash('sha256').update(token).digest('hex')
}
