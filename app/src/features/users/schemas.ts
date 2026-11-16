import { z } from 'zod'

// User profile response (SPEC-20 §4.4: GET /me).
export const userMeSchema = z.object({
  userId: z.string(),
})

export type UserMeResponse = z.infer<typeof userMeSchema>

// Interests request/response (SPEC-05 §4.3/§4.4: PUT /users/me/interests).
export const updateInterestsSchema = z.object({
  interests: z.array(z.string()),
})

export type UpdateInterestsRequest = z.infer<typeof updateInterestsSchema>
export type UpdateInterestsResponse = z.infer<typeof updateInterestsSchema>
