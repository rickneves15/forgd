import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { id, timestamps } from './_shared'

export const users = pgTable('users', {
  id: id(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  // Nullable — Google-only accounts never set a password.
  passwordHash: text('password_hash'),
  // Free text, optional, unverified — no institutional email/domain check.
  college: text('college'),
  // Values from constants.ts#INTEREST_TAGS — validated in Zod, not a DB constraint.
  interests: text('interests').array().notNull().default([]),
  avatarUrl: text('avatar_url'),
  // Only required at Apply-time, not at signup.
  resumeUrl: text('resume_url'),
  generalNotificationsEnabled: boolean('general_notifications_enabled')
    .notNull()
    .default(true),
  applicationNotificationsEnabled: boolean('application_notifications_enabled')
    .notNull()
    .default(true),
  // Soft delete — the only entity with one. Row is kept (anonymized at the
  // app layer), never hard-deleted, so every FK pointing at users can safely
  // stay NO ACTION/RESTRICT.
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  ...timestamps,
})
