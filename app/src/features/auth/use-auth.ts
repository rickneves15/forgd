import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'

import { queryClient } from '@/lib/query-client'
import {
  loginApi,
  logoutApi,
  oauthExchangeApi,
  refreshApi,
  registerApi,
} from './api'
import type { AuthUser } from './auth-store'
import { useAuthStore } from './auth-store'

type RegisterResponse = {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

type LoginResponse = {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

type RefreshResponse = {
  accessToken: string
  refreshToken: string
}

type OAuthExchangeResponse = {
  accessToken: string
  refreshToken: string
  user: AuthUser
  isNewUser: boolean
}

const ACCESS_TOKEN_KEY = '@forge:access-token'
const REFRESH_TOKEN_KEY = '@forge:refresh-token'

// React Query mutations for auth (SPEC-01, SPEC-02, SPEC-03, SPEC-04).
// Each mutation persists tokens to SecureStore, updates the Zustand auth
// store, and seeds the ['me'] React Query cache so downstream screens don't
// do a redundant GET /me round trip.

export function useRegister() {
  const queryClient = useQueryClient()
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: (payload: Parameters<typeof registerApi>[0]) =>
      registerApi(payload),

    onSuccess: (data) => {
      const { accessToken, refreshToken, user } = data.data as RegisterResponse
      SecureStore.setItem(ACCESS_TOKEN_KEY, accessToken)
      SecureStore.setItem(REFRESH_TOKEN_KEY, refreshToken)
      setSession(accessToken, refreshToken, user)
      queryClient.setQueryData(['me'], user)
    },
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: (payload: Parameters<typeof loginApi>[0]) => loginApi(payload),

    onSuccess: (data) => {
      const { accessToken, refreshToken, user } = data.data as LoginResponse
      SecureStore.setItem(ACCESS_TOKEN_KEY, accessToken)
      SecureStore.setItem(REFRESH_TOKEN_KEY, refreshToken)
      setSession(accessToken, refreshToken, user)
      queryClient.setQueryData(['me'], user)
    },
  })
}

export function useRefresh() {
  const setSession = useAuthStore((state) => state.setSession)
  const clearSession = useAuthStore((state) => state.clearSession)

  return useMutation({
    mutationFn: () => refreshApi(),

    onSuccess: (data) => {
      const { accessToken, refreshToken } = data.data as RefreshResponse
      SecureStore.setItem(ACCESS_TOKEN_KEY, accessToken)
      SecureStore.setItem(REFRESH_TOKEN_KEY, refreshToken)
      const user = useAuthStore.getState().user
      if (user) {
        setSession(accessToken, refreshToken, user)
      }
    },

    onError: () => {
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY)
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
      clearSession()
      queryClient.clear()
    },
  })
}

export function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession)

  return useMutation({
    mutationFn: () => logoutApi(),

    onSuccess: () => {
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY)
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
      clearSession()
      queryClient.clear()
    },

    // Logout that fails to reach the server is handled leniently: clear local
    // state regardless so the user isn't trapped in a signed-in-looking state.
    onError: () => {
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY)
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
      clearSession()
      queryClient.clear()
    },
  })
}

export function useOAuthExchange() {
  const queryClient = useQueryClient()
  const setSession = useAuthStore((state) => state.setSession)
  const router = useRouter()

  return useMutation({
    mutationFn: (code: string) => oauthExchangeApi(code),

    onSuccess: (data) => {
      const { accessToken, refreshToken, user, isNewUser } =
        data.data as OAuthExchangeResponse
      SecureStore.setItem(ACCESS_TOKEN_KEY, accessToken)
      SecureStore.setItem(REFRESH_TOKEN_KEY, refreshToken)
      setSession(accessToken, refreshToken, user)
      queryClient.setQueryData(['me'], user)

      if (isNewUser) {
        router.replace('/(auth)/choose-interests')
      } else {
        router.replace('/')
      }
    },
  })
}
