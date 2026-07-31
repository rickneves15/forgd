import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { id, timestamps } from './_shared'

/**
 * @see domain-model.md §User
 * @see SPEC-01 (register), SPEC-02 (login), SPEC-03 (Google OAuth),
 *      SPEC-05 (interests), SPEC-20/21/22 (profile), SPEC-24 (settings)
 */
export const users = pgTable('users', {
  id: id(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  // Nullable — Google-only accounts never set a password (SPEC-03).
  passwordHash: text('password_hash'),
  // Free text, optional, unverified — no institutional email/domain check (CONTEXT.md).
  college: text('college'),
  // Values from constants.ts#INTEREST_TAGS — validated in Zod, not a DB constraint (ADR-003).
  interests: text('interests').array().notNull().default([]),
  avatarUrl: text('avatar_url'),
  // Only required at Apply-time (SPEC-09), not at signup.
  resumeUrl: text('resume_url'),
  generalNotificationsEnabled: boolean('general_notifications_enabled')
    .notNull()
    .default(true),
  applicationNotificationsEnabled: boolean('application_notifications_enabled')
    .notNull()
    .default(true),
  // Soft delete — the only entity with one in V1 (SPEC-24). Row is kept
  // (anonymized at the app layer), never hard-deleted, so every FK pointing
  // at users can safely stay NO ACTION/RESTRICT (see ADR-003).
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  ...timestamps,
})
