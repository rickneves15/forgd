import { boolean, index, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from './_shared'
import { groups } from './groups'
import { users } from './users'

/**
 * @see domain-model.md §Task, SPEC-14
 */
export const tasks = pgTable(
  'tasks',
  {
    id: id(),
    groupId: uuid('group_id')
      .notNull()
      .references(() => groups.id),
    text: text('text').notNull(),
    // FK straight to users, validated against group membership at the app
    // layer (SPEC-14: INVALID_ASSIGNEE is checked in the handler, not the DB).
    assigneeId: uuid('assignee_id').references(() => users.id),
    done: boolean('done').notNull().default(false),
    ...timestamps,
  },
  (table) => [index('tasks_group_id_idx').on(table.groupId)],
)
