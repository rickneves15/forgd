import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { type TokenType, tokens } from '@/db/schema'

export const insertToken = async (data: {
  userId: string
  type: TokenType
  tokenHash: string
  expiresAt: Date
}) => {
  await db.insert(tokens).values(data)
}

export const findTokenByHashAndType = async (
  tokenHash: string,
  type: TokenType,
) => {
  const [token] = await db
    .select({
      userId: tokens.userId,
      expiresAt: tokens.expiresAt,
    })
    .from(tokens)
    .where(and(eq(tokens.tokenHash, tokenHash), eq(tokens.type, type)))
    .limit(1)

  return token ?? null
}

export const deleteTokensByUserId = async (userId: string, type: TokenType) => {
  await db
    .delete(tokens)
    .where(and(eq(tokens.userId, userId), eq(tokens.type, type)))
}
