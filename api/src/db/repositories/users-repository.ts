import { eq, or } from 'drizzle-orm'
import { db } from '@/db'
import { users } from '@/db/schema'

export const findUserByEmail = async (email: string) => {
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

// Used by register to detect an existing email OR username in one query
// (SPEC-01); returns the row's email so the caller can tell which one hit.
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

export const createUser = async (data: {
  username: string
  email: string
  passwordHash: string
  college?: string
}) => {
  const [user] = await db.insert(users).values(data).returning({
    id: users.id,
    username: users.username,
    email: users.email,
    college: users.college,
  })

  return user ?? null
}
