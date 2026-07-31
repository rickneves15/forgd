import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from './_shared'
import { users } from './users'

/**
 * @see SPEC-02 §6, SPEC-04 — one row per active refresh token.
 * Rotation (SPEC-04) deletes the old row and inserts a new one; logout
 * deletes the given row. Only the SHA-256 hash is stored, never the raw
 * token (same reasoning as password storage).
 */
export const refreshTokens = pgTable('refresh_tokens', {
  id: id(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ...timestamps,
})
