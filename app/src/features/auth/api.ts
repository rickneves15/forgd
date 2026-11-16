import { apiClient } from '@/http/api'
import type { LoginPayload, RegisterPayload } from './schemas'

type AuthResponse = {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    username: string
    email: string
    college: string | null
  }
}

type RefreshResponse = {
  accessToken: string
  refreshToken: string
}

type OAuthExchangeResponse = AuthResponse & {
  isNewUser: boolean
}

type LogoutResponse = {
  success: boolean
}

// Auth endpoint functions (SPEC-01, SPEC-02, SPEC-03, SPEC-04).
// All API logic lives here — never inline in UI components.

export const registerApi = (payload: RegisterPayload) =>
  apiClient.post<AuthResponse>('/auth/register', payload)

export const loginApi = (payload: LoginPayload) =>
  apiClient.post<AuthResponse>('/auth/login', payload)

export const refreshApi = () => apiClient.post<RefreshResponse>('/auth/refresh')

export const logoutApi = () => apiClient.post<LogoutResponse>('/auth/logout')

export const oauthExchangeApi = (code: string) =>
  apiClient.post<OAuthExchangeResponse>('/auth/oauth/exchange', { code })
