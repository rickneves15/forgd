import { create } from 'zustand'

export type AuthUser = {
  id: string
  username: string
  email: string
  college: string | null
}

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  setSession: (
    accessToken: string,
    refreshToken: string,
    user: AuthUser,
  ) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  setSession: (accessToken, refreshToken, user) =>
    set({ accessToken, refreshToken, user, isAuthenticated: true }),
  clearSession: () =>
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    }),
}))
