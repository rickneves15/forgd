import { z } from 'zod'
import { userSchema } from './user'

/**
 * Response of the mobile OAuth exchange — the token pair plus the caller's
 * user snapshot. `isNewUser` lets the client show onboarding instead of the
 * home screen. This same shape is the payload carried by the one-time code.
 */
export const oauthSuccessSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: userSchema,
  isNewUser: z.boolean(),
})

export type OauthSuccess = z.infer<typeof oauthSuccessSchema>
