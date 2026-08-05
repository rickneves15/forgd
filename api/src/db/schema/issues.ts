import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from './_shared'
import { projects } from './projects'
import { users } from './users'

export const issues = pgTable(
  'issues',
  {
    id: id(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id),
    text: text('text').notNull(),
    ...timestamps,
  },
  (table) => [index('issues_project_id_idx').on(table.projectId)],
)

export const comments = pgTable(
  'comments',
  {
    id: id(),
    issueId: uuid('issue_id')
      .notNull()
      .references(() => issues.id),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id),
    text: text('text').notNull(),
    ...timestamps,
  },
  (table) => [index('comments_issue_id_idx').on(table.issueId)],
)
