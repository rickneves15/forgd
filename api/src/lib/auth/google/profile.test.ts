import { makeGoogleProfile } from '@test/factories/auth/google'
import type { Profile as GoogleProfile } from 'passport-google-oauth20'
import { describe, expect, it } from 'vitest'
import { normalizeGoogleProfile } from './profile'

describe('normalizeGoogleProfile', () => {
  it('maps the profile fields the app trusts', () => {
    const profile = makeGoogleProfile({
      email: 'joao@example.com',
      emailVerified: true,
      name: 'João Silva',
      pictureUrl: 'https://example.com/avatar.png',
    })

    const result = normalizeGoogleProfile(profile)

    expect(result).toEqual({
      googleId: profile.id,
      email: 'joao@example.com',
      emailVerified: true,
      name: 'João Silva',
      pictureUrl: 'https://example.com/avatar.png',
    })
  })

  it('treats a missing email_verified claim as unverified', () => {
    const profile = makeGoogleProfile()
    // A profile without the signed claim must never be treated as verified.
    delete (profile._json as { email_verified?: boolean }).email_verified

    expect(normalizeGoogleProfile(profile).emailVerified).toBe(false)
  })

  it('falls back to null name and picture when absent', () => {
    const profile = makeGoogleProfile() as Partial<GoogleProfile>
    delete profile.displayName
    delete profile.photos

    const result = normalizeGoogleProfile(profile as GoogleProfile)

    expect(result.name).toBeNull()
    expect(result.pictureUrl).toBeNull()
  })

  it('reads email from the first address when present', () => {
    const profile = makeGoogleProfile({ email: 'primary@example.com' })

    expect(normalizeGoogleProfile(profile).email).toBe('primary@example.com')
  })

  it('keeps the raw google id untouched', () => {
    const profile = makeGoogleProfile({ id: 'google-account-123' })

    expect(normalizeGoogleProfile(profile).googleId).toBe('google-account-123')
  })
})
