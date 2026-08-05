import {
  createUserWithOauthIdentity,
  findUserByProviderAndSub,
  insertOauthAccount,
} from '@/db/repositories/oauth-accounts-repository'
import { findUserByEmail } from '@/db/repositories/users-repository'
import type {
  NormalizedGoogleProfile,
  ResolveGoogleIdentityResult,
} from '@/schemas'
import { generateUniqueUsername } from './username'

/**
 * Maps a (verified) Google profile to a User, in order:
 *
 *  1. Same (provider, sub) — the only match that survives an email change.
 *  2. Auto-link: the email belongs to an existing User — record the identity.
 *  3. Create: fresh User + identity in one transaction, with an
 *     auto-generated username (there is no "pick a username" step on mobile).
 *
 * `isNewUser` lets the client show onboarding instead of the home screen.
 * Never throws for a normal flow — a profile always resolves to a user.
 */
export const resolveGoogleIdentity = async (
  profile: NormalizedGoogleProfile,
): Promise<ResolveGoogleIdentityResult> => {
  const bySub = await findUserByProviderAndSub('google', profile.googleId)
  if (bySub) {
    return { user: bySub, isNewUser: false }
  }

  const byEmail = await findUserByEmail(profile.email)
  if (byEmail) {
    await insertOauthAccount({
      userId: byEmail.id,
      provider: 'google',
      providerAccountId: profile.googleId,
      email: profile.email,
      name: profile.name,
      pictureUrl: profile.pictureUrl,
    })

    return {
      user: {
        id: byEmail.id,
        username: byEmail.username,
        email: byEmail.email,
        college: byEmail.college,
      },
      isNewUser: false,
    }
  }

  const username = await generateUniqueUsername(profile.email)
  const created = await createUserWithOauthIdentity({
    provider: 'google',
    providerAccountId: profile.googleId,
    email: profile.email,
    name: profile.name,
    pictureUrl: profile.pictureUrl,
    username,
  })
  if (!created) {
    throw new Error('Failed to create user with Google identity')
  }

  return { user: created, isNewUser: true }
}
