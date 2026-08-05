import { z } from 'zod'
import { OAUTH_PROVIDERS } from '@/db/schema/constants'
import { userSchema } from './user'

// The slice of the Google profile the app trusts. Everything else in the
// strategy profile is caller-controlled surface and must not be used for
// identity or display decisions. emailVerified gates account creation —
// unverified emails are rejected, never silently promoted.
export const normalizedGoogleProfileSchema = z.object({
  googleId: z.string(),
  email: z.email(),
  emailVerified: z.boolean(),
  name: z.string().nullable(),
  pictureUrl: z.string().nullable(),
})

export type NormalizedGoogleProfile = z.infer<
  typeof normalizedGoogleProfileSchema
>

// Identity row written to oauth_accounts when linking a provider identity.
export const oauthIdentityDataSchema = z.object({
  userId: z.string(),
  provider: z.enum(OAUTH_PROVIDERS),
  providerAccountId: z.string(),
  email: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  pictureUrl: z.string().nullable().optional(),
})

export type OauthIdentityData = z.infer<typeof oauthIdentityDataSchema>

// Creates a User with its first identity in a single transaction.
export const createUserWithIdentitySchema = z.object({
  username: z.string(),
  email: z.string(),
  provider: z.enum(OAUTH_PROVIDERS),
  providerAccountId: z.string(),
  name: z.string().nullable().optional(),
  pictureUrl: z.string().nullable().optional(),
  avatarUrl: z.string().optional(),
})

export type CreateUserWithIdentity = z.infer<
  typeof createUserWithIdentitySchema
>

// Result of mapping a Google profile to a User. isNewUser lets the client
// show onboarding instead of the home screen.
export const resolveGoogleIdentityResultSchema = z.object({
  user: userSchema,
  isNewUser: z.boolean(),
})

export type ResolveGoogleIdentityResult = z.infer<
  typeof resolveGoogleIdentityResultSchema
>
