import { faker } from '@faker-js/faker'

export type UserPayload = {
  username: string
  email: string
  password: string
  college?: string
}

export type UserPayloadOverrides = Partial<UserPayload>

// Builds a valid register payload with faker-generated data. Every field stays
// within the register route's zod limits (username 3-30 chars, valid email,
// password >= 8 chars), so callers only override what a given test needs.
export const makeUserPayload = (
  overrides: UserPayloadOverrides = {},
): UserPayload => {
  const username = faker.internet.username().slice(0, 30)
  const safeUsername = username.length >= 3 ? username : `user-${username}`

  return {
    username: safeUsername,
    email: faker.internet.email(),
    password: faker.internet.password({ length: 12 }),
    ...overrides,
  }
}
