import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { refreshTokens } from '@/db/schema'

export const insertRefreshToken = async (data: {
  userId: string
  tokenHash: string
  expiresAt: Date
}) => {
  await db.insert(refreshTokens).values(data)
}

export const findRefreshTokenByHash = async (tokenHash: string) => {
  const [token] = await db
    .select({
      userId: refreshTokens.userId,
      expiresAt: refreshTokens.expiresAt,
    })
    .from(refreshTokens)
    .where(eq(refreshTokens.tokenHash, tokenHash))
    .limit(1)

  return token ?? null
}

export const deleteRefreshTokensByUserId = async (userId: string) => {
  await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId))
}
