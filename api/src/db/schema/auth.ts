import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from './_shared'
import { users } from './users'

/**
 * Single table for every server-issued token. The `type` column keeps the
 * revocation record for distinct credentials (access, refresh, later password
 * reset / email verification) in one place.
 *
 * Only the SHA-256 hash is stored, never the raw token (same reasoning as
 * password storage). A token is valid iff a non-expired row with its hash
 * exists — deleting the row (rotation, logout) revokes it immediately, so
 * stateless JWTs stay revocable. Expired rows are swept by a cleanup job.
 *
 * @see SPEC-02 §6, SPEC-04
 */
export const tokens = pgTable('tokens', {
  id: id(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  type: text('type').notNull(),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ...timestamps,
})

export const tokenTypes = ['access', 'refresh'] as const
export type TokenType = (typeof tokenTypes)[number]
