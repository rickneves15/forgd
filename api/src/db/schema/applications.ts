import { index, pgTable, text, unique, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from './_shared'
import { projects } from './projects'
import { users } from './users'

export const applications = pgTable(
  'applications',
  {
    id: id(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id),
    applicantId: uuid('applicant_id')
      .notNull()
      .references(() => users.id),
    status: text('status').notNull().default('pending'), // pending | accepted | rejected
    // Snapshot of the resume at apply-time — not a live reference to
    // users.resumeUrl, so later profile edits don't change past applications.
    resumeUrl: text('resume_url').notNull(),
    ...timestamps,
  },
  (table) => [
    unique('applications_project_applicant_unique').on(
      table.projectId,
      table.applicantId,
    ),
    index('applications_project_id_idx').on(table.projectId),
    index('applications_applicant_id_idx').on(table.applicantId),
  ],
)
