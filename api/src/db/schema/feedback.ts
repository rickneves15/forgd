import { pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from './_shared'
import { users } from './users'

/**
 * @see domain-model.md §Feedback, SPEC-24 §3.2 — one-way submission, no reply/thread.
 */
export const feedback = pgTable('feedback', {
  id: id(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  text: text('text').notNull(),
  ...timestamps,
})
