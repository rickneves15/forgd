import { faker } from '@faker-js/faker'
import type { Profile as GoogleProfile } from 'passport-google-oauth20'

export type GoogleProfileOverrides = {
  id?: string
  email?: string
  // Drives BOTH `_json.email_verified` and the informational `emails[].verified`
  // so the profile is always internally consistent.
  emailVerified?: boolean
  name?: string | null
  pictureUrl?: string | null
}

// Builds a Google profile as the strategy would return it after a token
// exchange. Defaults to a verified email (the only profiles the app accepts).
// Tests override fields via `overrides`.
export const makeGoogleProfile = (
  overrides: GoogleProfileOverrides = {},
): GoogleProfile => {
  const email = overrides.email ?? faker.internet.email()
  const emailVerified = overrides.emailVerified ?? true
  const name = overrides.name ?? faker.person.fullName()
  const pictureUrl = overrides.pictureUrl ?? faker.image.avatar()

  return {
    id: overrides.id ?? `google-${faker.string.uuid()}`,
    provider: 'google',
    displayName: name,
    emails: [{ value: email, verified: emailVerified }],
    photos: [{ value: pictureUrl }],
    profileUrl: '',
    _raw: '',
    _json: {
      iss: 'https://accounts.google.com',
      aud: 'test-client-id',
      sub: 'google-sub',
      email,
      email_verified: emailVerified,
      name,
      picture: pictureUrl,
    },
  } as GoogleProfile
}
