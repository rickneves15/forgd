import { boolean, index, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from './_shared'
import { groups } from './groups'
import { users } from './users'

export const tasks = pgTable(
  'tasks',
  {
    id: id(),
    groupId: uuid('group_id')
      .notNull()
      .references(() => groups.id),
    text: text('text').notNull(),
    // FK straight to users; membership in the group is validated at the app
    // layer (the DB has no notion of "assignee must belong to the group").
    assigneeId: uuid('assignee_id').references(() => users.id),
    done: boolean('done').notNull().default(false),
    ...timestamps,
  },
  (table) => [index('tasks_group_id_idx').on(table.groupId)],
)
