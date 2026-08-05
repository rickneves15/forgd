import { pgTable, text, unique, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from './_shared'
import { users } from './users'

/**
 * One row per external-provider identity linked to a User. A User can have
 * several identities but at most one per provider.
 *
 * `email`, `name`, `pictureUrl` are informational snapshots — login always
 * matches on `(provider, providerAccountId)`.
 */
export const oauthAccounts = pgTable(
  'oauth_accounts',
  {
    id: id(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    provider: text('provider').notNull(),
    // The provider's stable sub/id.
    providerAccountId: text('provider_account_id').notNull(),
    email: text('email'),
    name: text('name'),
    pictureUrl: text('picture_url'),
    ...timestamps,
  },
  (table) => [
    unique('oauth_accounts_provider_account_unique').on(
      table.provider,
      table.providerAccountId,
    ),
    unique('oauth_accounts_user_provider_unique').on(
      table.userId,
      table.provider,
    ),
  ],
)
