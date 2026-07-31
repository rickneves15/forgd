import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { refreshTokens } from '@/db/schema'

// Revokes every active refresh token for a user. Used on logout and on
// refresh-token rotation (SPEC-04). Returns the query result so callers can
// inspect how many rows were actually revoked (e.g. for logging).
export const deleteAllTokensByUserId = async (userId: string) => {
  return db.delete(refreshTokens).where(eq(refreshTokens.userId, userId))
}
