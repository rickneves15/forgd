import { index, pgTable, text, unique, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from './_shared'
import { projects } from './projects'
import { users } from './users'

export const groups = pgTable('groups', {
  id: id(),
  projectId: uuid('project_id')
    .notNull()
    .unique()
    .references(() => projects.id),
  ...timestamps,
})

export const groupMembers = pgTable(
  'group_members',
  {
    id: id(),
    groupId: uuid('group_id')
      .notNull()
      .references(() => groups.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    // 'admin' | 'member' — only the project owner is ever 'admin', set once
    // at creation. No promotion flow exists, so this isn't a DB constraint.
    role: text('role').notNull().default('member'),
    ...timestamps,
  },
  (table) => [
    unique('group_members_group_user_unique').on(table.groupId, table.userId),
    index('group_members_group_id_idx').on(table.groupId),
    index('group_members_user_id_idx').on(table.userId),
  ],
)
