import { index, pgTable, text, unique, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from './_shared'
import { projects } from './projects'
import { users } from './users'

/**
 * @see domain-model.md §Group — one Group per open Project, created
 * automatically at the same time as the Project (SPEC-06).
 */
export const groups = pgTable('groups', {
  id: id(),
  projectId: uuid('project_id')
    .notNull()
    .unique()
    .references(() => projects.id),
  ...timestamps,
})

/**
 * @see domain-model.md §GroupMember, SPEC-18 (list), SPEC-19 (direct invite)
 */
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
    // 'admin' | 'member' — only the project owner is ever 'admin' in V1,
    // set once at creation. No promotion flow exists, so this isn't enforced
    // as a DB constraint (see ADR-003).
    role: text('role').notNull().default('member'),
    ...timestamps,
  },
  (table) => [
    unique('group_members_group_user_unique').on(table.groupId, table.userId),
    index('group_members_group_id_idx').on(table.groupId),
    index('group_members_user_id_idx').on(table.userId),
  ],
)
