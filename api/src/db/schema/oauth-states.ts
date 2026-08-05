import { pgTable, timestamp } from 'drizzle-orm/pg-core'
import { id } from './_shared'

// One row per in-flight Google OAuth dance. The row `id` (UUID v7) is the
// opaque `state` sent to Google and echoed back on the callback, doubling as
// the anti-CSRF token.
//
// Rows are short-lived (~10 min), single-use (deleted on consume), and swept
// opportunistically by a purge on insert. This is what keeps the API
// sessionless — no @fastify/session, no cookie. createdAt but no updatedAt:
// rows are immutable, never mutated after insert.
export const oauthStates = pgTable('oauth_states', {
  id: id(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
})
