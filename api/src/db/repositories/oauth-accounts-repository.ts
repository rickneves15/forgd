import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import type { OAuthProvider } from '@/db/schema'
import { oauthAccounts, users } from '@/db/schema'
import type {
  CreateUserWithIdentity,
  OauthIdentityData,
  UserSnapshot,
} from '@/schemas'

const userFields = {
  id: users.id,
  username: users.username,
  email: users.email,
  college: users.college,
}

// The only lookup that can guarantee "same provider account, same Forgd
// account" even when the provider email changes.
export const findUserByProviderAndSub = async (
  provider: OAuthProvider,
  providerAccountId: string,
): Promise<UserSnapshot | null> => {
  const [user] = await db
    .select(userFields)
    .from(oauthAccounts)
    .innerJoin(users, eq(oauthAccounts.userId, users.id))
    .where(
      and(
        eq(oauthAccounts.provider, provider),
        eq(oauthAccounts.providerAccountId, providerAccountId),
      ),
    )
    .limit(1)

  return user ?? null
}

// Records an auto-link: a login whose provider identity is new but whose email
// matches an existing User.
export const insertOauthAccount = async (data: OauthIdentityData) => {
  await db.insert(oauthAccounts).values({
    userId: data.userId,
    provider: data.provider,
    providerAccountId: data.providerAccountId,
    email: data.email ?? null,
    name: data.name ?? null,
    pictureUrl: data.pictureUrl ?? null,
  })
}

// Creates the User and its first identity in a single transaction — never a
// User without a way back in.
export const createUserWithOauthIdentity = async (
  data: CreateUserWithIdentity,
): Promise<UserSnapshot | null> => {
  const user = await db.transaction(async (tx) => {
    const [createdUser] = await tx
      .insert(users)
      .values({
        username: data.username,
        email: data.email,
        passwordHash: null,
        avatarUrl: data.avatarUrl,
      })
      .returning(userFields)

    if (!createdUser) {
      return null
    }

    await tx.insert(oauthAccounts).values({
      userId: createdUser.id,
      provider: data.provider,
      providerAccountId: data.providerAccountId,
      email: data.email ?? null,
      name: data.name ?? null,
      pictureUrl: data.pictureUrl ?? null,
    })

    return createdUser
  })

  return user ?? null
}
