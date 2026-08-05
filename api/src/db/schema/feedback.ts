import { pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from './_shared'
import { users } from './users'

// One-way submission — no replies or threads.
export const feedback = pgTable('feedback', {
  id: id(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  text: text('text').notNull(),
  ...timestamps,
})
