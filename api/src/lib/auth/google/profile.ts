import type { Profile as GoogleProfile } from 'passport-google-oauth20'
import {
  type NormalizedGoogleProfile,
  normalizedGoogleProfileSchema,
} from '@/schemas'

// Extracts the trusted slice of the raw Google profile and validates it
// (normalizedGoogleProfileSchema). Everything else in the strategy profile is
// caller-controlled surface and must not be used for identity or display
// decisions.
export const normalizeGoogleProfile = (
  profile: GoogleProfile,
): NormalizedGoogleProfile => {
  const email = profile.emails?.[0]?.value ?? ''

  return normalizedGoogleProfileSchema.parse({
    googleId: profile.id,
    email,
    // `_json.email_verified` is the id_token claim Google actually signs;
    // the `emails[].verified` array is informational and defaults to false.
    emailVerified: profile._json.email_verified ?? false,
    name: profile.displayName || null,
    pictureUrl: profile.photos?.[0]?.value ?? null,
  })
}
