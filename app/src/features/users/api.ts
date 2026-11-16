import { apiClient } from '@/http/api'
import type {
  UpdateInterestsRequest,
  UpdateInterestsResponse,
  UserMeResponse,
} from './schemas'

// Users endpoint functions (SPEC-20: GET /me, SPEC-05: PUT /users/me/interests).
// All API logic lives here — never inline in UI components.

export const getMeApi = () => apiClient.get<UserMeResponse>('/me')

export const updateInterestsApi = (payload: UpdateInterestsRequest) =>
  apiClient.put<UpdateInterestsResponse>('/users/me/interests', payload)
