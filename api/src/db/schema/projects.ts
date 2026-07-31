import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  uuid,
} from 'drizzle-orm/pg-core'
import { id, timestamps } from './_shared'
import { users } from './users'

/**
 * @see domain-model.md §Project
 * @see SPEC-06 (create), SPEC-07 (feed), SPEC-08 (detail), SPEC-20/21 (status toggle)
 */
export const projects = pgTable(
  'projects',
  {
    id: id(),
    ownerId: uuid('owner_id')
      .notNull()
      .references(() => users.id),
    title: text('title').notNull(),
    description: text('description').notNull(),
    // Value from constants.ts#INTEREST_TAGS (SPEC-06: "enum matching interests tags").
    category: text('category').notNull(),
    // Free text — deliberately NOT constrained to a fixed list (see ADR-003).
    topic: text('topic').notNull(),
    // Recruiting fields — all optional; presence of openings > 0 is what makes
    // a project "open" (SPEC-06).
    stipend: integer('stipend'),
    durationMonths: integer('duration_months'),
    responsibilities: text('responsibilities'),
    openings: integer('openings'),
    // Stored, computed once at insert time from `openings > 0` — never
    // recomputed after creation in V1 (no reopen/close action yet — SPEC-06 §6).
    isOpen: boolean('is_open').notNull().default(false),
    // "active" | "done" — manually toggled by the owner (SPEC-20/21),
    // unrelated to isOpen.
    status: text('status').notNull().default('active'),
    ...timestamps,
  },
  (table) => [
    index('projects_owner_id_idx').on(table.ownerId),
    index('projects_is_open_idx').on(table.isOpen),
  ],
)

/**
 * @see ADR-003 — separate table (not a text[] column) since attachments may
 * genuinely grow richer fields later (caption, uploader, file size).
 */
export const projectAttachments = pgTable(
  'project_attachments',
  {
    id: id(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id),
    url: text('url').notNull(),
    kind: text('kind').notNull(), // 'photo' | 'pdf' — constants.ts#ATTACHMENT_KINDS
    position: integer('position').notNull().default(0),
    ...timestamps,
  },
  (table) => [index('project_attachments_project_id_idx').on(table.projectId)],
)
