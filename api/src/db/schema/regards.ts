import { index, pgTable, unique, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from './_shared'
import { users } from './users'

/**
 * @see domain-model.md §Regard, SPEC-23
 * Individual (giverId, receiverId) rows are kept even though V1 shows no
 * list of who gave a Regard — that's what makes ALREADY_REGARDED enforceable,
 * and `regardsCount` is a COUNT(*) over this table (see ADR-003), not a
 * denormalized column.
 */
export const regards = pgTable(
  'regards',
  {
    id: id(),
    giverId: uuid('giver_id')
      .notNull()
      .references(() => users.id),
    receiverId: uuid('receiver_id')
      .notNull()
      .references(() => users.id),
    ...timestamps,
  },
  (table) => [
    unique('regards_giver_receiver_unique').on(table.giverId, table.receiverId),
    index('regards_receiver_id_idx').on(table.receiverId),
  ],
)
