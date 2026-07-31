import { boolean, index, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from './_shared'
import { projects } from './projects'
import { users } from './users'

/**
 * @see domain-model.md §Notification, SPEC-12
 */
export const notifications = pgTable(
  'notifications',
  {
    id: id(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id), // recipient
    type: text('type').notNull(), // 'general' | 'application_status'
    message: text('message').notNull(),
    targetProjectId: uuid('target_project_id').references(() => projects.id),
    read: boolean('read').notNull().default(false),
    ...timestamps,
  },
  (table) => [index('notifications_user_id_idx').on(table.userId)],
)
