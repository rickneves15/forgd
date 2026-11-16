import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import * as SecureStore from 'expo-secure-store'

import { storageKeys } from '@/utils/storage-keys'
import { ApiError } from './errors'

const baseURL = process.env.EXPO_PUBLIC_API_URL

if (!baseURL) {
  throw new Error(
    'EXPO_PUBLIC_API_URL is not set. Create a .env file (see .env.example).',
  )
}

// The smallest contract the client needs from token storage: read the current
// access/refresh pair, overwrite it after a rotation, clear it on logout or
// refresh failure. The default implementation wraps expo-secure-store through
// storage-keys; tests or other storage backends can be injected instead.
export interface TokenStore {
  getAccessToken: () => Promise<string | null>
  getRefreshToken: () => Promise<string | null>
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>
  clearTokens: () => Promise<void>
}

const defaultTokenStore: TokenStore = {
  getAccessToken: () => SecureStore.getItemAsync(storageKeys.accessToken),
  getRefreshToken: () => SecureStore.getItemAsync(storageKeys.refreshToken),
  setTokens: async (accessToken, refreshToken) => {
    await SecureStore.setItem(storageKeys.accessToken, accessToken)
    await SecureStore.setItem(storageKeys.refreshToken, refreshToken)
  },
  clearTokens: async () => {
    await SecureStore.deleteItemAsync(storageKeys.accessToken)
    await SecureStore.deleteItemAsync(storageKeys.refreshToken)
  },
}

type RetryableRequest = InternalAxiosRequestConfig & {
  _retry?: boolean
}

// Creates a configured axios client. One module owns: token attachment on the
// request, API-code → error mapping on the response, and silent refresh +
// exactly-one retry on 401. Callers just use `apiClient.get/post/...`.
export const createApiClient = (tokenStore: TokenStore = defaultTokenStore) => {
  const client = axios.create({
    baseURL,
    timeout: 15000,
  })

  // Request: attach the stored access token to every outgoing call.
  client.interceptors.request.use(async (config) => {
    const accessToken = await tokenStore.getAccessToken()
    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`)
    }
    return config
  })

  // Response: map API error bodies to ApiError, and on 401 attempt exactly one
  // silent refresh + retry. Never retries more than once per failed request.
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableRequest

      // 401 + not already retried → try a silent refresh, then retry once.
      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        tokenStore.getRefreshToken
      ) {
        originalRequest._retry = true

        const refreshToken = await tokenStore.getRefreshToken()
        if (refreshToken) {
          try {
            // Call /auth/refresh directly (plain axios) so the response
            // interceptor can't intercept this call and loop forever.
            const res = await axios.post<{
              accessToken: string
              refreshToken: string
            }>(`${baseURL}/auth/refresh`, undefined, {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            })

            const { accessToken, refreshToken: newRefreshToken } = res.data
            await tokenStore.setTokens(accessToken, newRefreshToken)

            originalRequest.headers.set(
              'Authorization',
              `Bearer ${accessToken}`,
            )
            return client(originalRequest)
          } catch {
            // Refresh failed: session is dead. Clear local tokens so the app
            // doesn't look signed in; the caller (or its screen) decides the
            // UI behaviour per APP-04 §7 (route to Sign in, no banner).
            await tokenStore.clearTokens()
            throw new ApiError(
              'INVALID_REFRESH_TOKEN',
              'Invalid refresh token',
              401,
            )
          }
        }
      }

      // Map the API error body to a normalized ApiError. Screens map `code`
      // to UI behaviour per their APP-XX §7 table.
      const status = error.response?.status ?? 0
      const data = error.response?.data as
        | { code?: string; message?: string }
        | undefined
      const code =
        data?.code ?? (status === 401 ? 'UNAUTHORIZED' : 'UNKNOWN_ERROR')
      const message = data?.message ?? error.message ?? 'Request failed'

      throw new ApiError(code, message, status)
    },
  )

  return client
}

// The single app-wide client. Do not create ad-hoc axios instances.
export const apiClient = createApiClient()
