import { index, pgTable, unique, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from './_shared'
import { projects } from './projects'
import { users } from './users'

/**
 * @see domain-model.md §Bookmark, SPEC-11
 */
export const bookmarks = pgTable(
  'bookmarks',
  {
    id: id(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id),
    ...timestamps,
  },
  (table) => [
    unique('bookmarks_user_project_unique').on(table.userId, table.projectId),
    index('bookmarks_user_id_idx').on(table.userId),
  ],
)
