import { deleteRefreshTokensByUserId } from '@/repositories/refresh-tokens-repository'

export const logoutUser = async (userId: string) => {
  await deleteRefreshTokensByUserId(userId)
}
