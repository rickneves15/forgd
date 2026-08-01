import { createHash } from 'node:crypto'

// Refresh tokens are stored only as a SHA-256 hash — the revocation record is
// the row's existence, never the raw JWT (see SPEC-04 §6, schema/auth.ts).
export const hashToken = (token: string) => {
  return createHash('sha256').update(token).digest('hex')
}
