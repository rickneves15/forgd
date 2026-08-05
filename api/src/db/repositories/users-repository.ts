import { eq, or } from 'drizzle-orm'
import { db } from '@/db'
import { users } from '@/db/schema'
import type { CreateUser, UserWithPassword } from '@/schemas'

export const findUserByEmail = async (
  email: string,
): Promise<UserWithPassword | null> => {
  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      college: users.college,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  return user ?? null
}

// Used by register to detect an existing email OR username in one query;
// returns the row's email so the caller can tell which one hit.
export const findUserByEmailOrUsername = async (
  email: string,
  username: string,
) => {
  const [user] = await db
    .select({ email: users.email })
    .from(users)
    .where(or(eq(users.email, email), eq(users.username, username)))
    .limit(1)

  return user ?? null
}

export const findUserByUsername = async (username: string) => {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1)

  return user ?? null
}

export const createUser = async (data: CreateUser) => {
  const [user] = await db
    .insert(users)
    .values({
      username: data.username,
      email: data.email,
      passwordHash: data.passwordHash ?? null,
      college: data.college,
      avatarUrl: data.avatarUrl,
    })
    .returning({
      id: users.id,
      username: users.username,
      email: users.email,
      college: users.college,
    })

  return user ?? null
}
