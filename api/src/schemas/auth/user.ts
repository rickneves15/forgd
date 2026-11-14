import { z } from 'zod'

// The User projection returned by the auth routes (register, login, oauth
// exchange) — one shared shape instead of three hand-written copies.
export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  college: z.string().nullable(),
})

export type UserSnapshot = z.infer<typeof userSchema>

// Projects a user row to the client-facing snapshot: exactly the four fields
// auth routes return, nothing more. Strips passwordHash and any other row
// fields the client must not see. One module owns this shape so adding or
// removing a field touches one call site.
export const userSnapshot = (user: UserSnapshot): UserSnapshot => ({
  id: user.id,
  username: user.username,
  email: user.email,
  college: user.college,
})

// Full user row as found by findUserByEmail — includes the password hash so
// login can compare it. Google-only accounts carry null.
export const userWithPasswordSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  college: z.string().nullable(),
  passwordHash: z.string().nullable(),
})

export type UserWithPassword = z.infer<typeof userWithPasswordSchema>

// Input to createUser. passwordHash is nullable — Google-only accounts are
// created without one.
export const createUserSchema = z.object({
  username: z.string(),
  email: z.string(),
  passwordHash: z.string().nullable().optional(),
  college: z.string().optional(),
  avatarUrl: z.string().optional(),
})

export type CreateUser = z.infer<typeof createUserSchema>
