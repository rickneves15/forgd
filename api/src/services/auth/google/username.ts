import { findUserByUsername } from '@/db/repositories/users-repository'

const MIN_USERNAME_LENGTH = 3
const MAX_USERNAME_LENGTH = 30

// Lowercase, strip accents, keep [a-z0-9], cap at the register limit.
// ("João Silva" → "joaosilva"). Kept DB-light: the repository only checks
// uniqueness, never writes.
const normalizeBase = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, MAX_USERNAME_LENGTH)

// The username base is the email's local part — the "joao.silva" in
// "joao.silva@gmail.com". It's stable (display names change) and personal.
const localPartOf = (email: string) => email.split('@')[0] ?? ''

const randomDigits = () => Math.floor(1000 + Math.random() * 9000).toString()

const isAvailable = async (username: string) =>
  (await findUserByUsername(username)) === null

/**
 * Auto-generates a unique username from the Google account's email — there's
 * no "pick a username" step in the Google flow.
 *
 * Rules: normalized email local part; numeric suffix on collision (joaosilva,
 * joaosilva1, ...); `user<random>` fallback when the local part normalizes to
 * nothing short (< 3 chars) or every variant is taken.
 */
export const generateUniqueUsername = async (email: string) => {
  const base = normalizeBase(localPartOf(email))
  const hasValidBase = base.length >= MIN_USERNAME_LENGTH

  const initial = hasValidBase ? base : `user${randomDigits()}`
  if (await isAvailable(initial)) {
    return initial
  }

  if (hasValidBase) {
    const numberedBase = base.slice(0, MAX_USERNAME_LENGTH - 1)
    for (let i = 1; i <= 9; i++) {
      const candidate = `${numberedBase}${i}`
      if (await isAvailable(candidate)) {
        return candidate
      }
    }
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `user${randomDigits()}`
    if (await isAvailable(candidate)) {
      return candidate
    }
  }

  throw new Error('Unable to generate a unique username')
}
