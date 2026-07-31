import {
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'
import { id, timestamps } from './_shared'
import { groups } from './groups'
import { users } from './users'

/**
 * Group Chat messages (SPEC-17) — real WebSocket from V1, persisted
 * synchronously before broadcast. Distinct from directMessages below
 * (1:1, SPEC-25) — separate socket namespace, separate table.
 *
 * NOTE: this table wasn't explicitly named as its own entity in
 * domain-model.md (only implied under Group's "Group Chat" capability,
 * unlike DirectMessage which has its own entity block) — added here to
 * match SPEC-17's contract. Worth a small domain-model.md addition.
 */
export const groupMessages = pgTable(
  'group_messages',
  {
    id: id(),
    groupId: uuid('group_id')
      .notNull()
      .references(() => groups.id),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id),
    text: text('text').notNull(),
    ...timestamps,
  },
  (table) => [index('group_messages_group_id_idx').on(table.groupId)],
)

/**
 * One row per 1:1 pair — created on the first message between two users.
 * `participant1Id` is always the lexicographically-smaller of the two user
 * ids, so the pair is always found regardless of who messaged first
 * (SPEC-25 §3.3). Exists as its own table (not just a derived conversationId
 * on each message) so a future "DM inbox" list is a cheap indexed query
 * instead of a DISTINCT ON over the full message history — see ADR-003.
 */
export const conversations = pgTable(
  'conversations',
  {
    id: id(),
    participant1Id: uuid('participant_1_id')
      .notNull()
      .references(() => users.id),
    participant2Id: uuid('participant_2_id')
      .notNull()
      .references(() => users.id),
    lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    unique('conversations_participants_unique').on(
      table.participant1Id,
      table.participant2Id,
    ),
    index('conversations_participant_1_idx').on(table.participant1Id),
    index('conversations_participant_2_idx').on(table.participant2Id),
  ],
)

/**
 * @see domain-model.md §DirectMessage, SPEC-25
 */
export const directMessages = pgTable(
  'direct_messages',
  {
    id: id(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversations.id),
    senderId: uuid('sender_id')
      .notNull()
      .references(() => users.id),
    text: text('text').notNull(),
    ...timestamps,
  },
  (table) => [
    index('direct_messages_conversation_id_idx').on(table.conversationId),
  ],
)
