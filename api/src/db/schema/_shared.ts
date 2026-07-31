import { timestamp, uuid } from 'drizzle-orm/pg-core'
import { generateUUID } from '@/lib/uuid'

/**
 * Every table's primary key: UUID v7, generated client-side.
 * Postgres has no built-in v7 generator (gen_random_uuid() only produces v4),
 * so we generate it in JS via the `uuid` package instead of a SQL default.
 * See ADR-003.
 */
export const id = () =>
  uuid('id')
    .primaryKey()
    .$defaultFn(() => generateUUID())

/**
 * createdAt/updatedAt on every table, uniformly — no per-table judgment calls
 * about which ones "need" updatedAt. See ADR-003.
 */
export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}
