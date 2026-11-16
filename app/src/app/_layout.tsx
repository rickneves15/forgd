import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular'
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium'
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold'
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold'
import { QueryClientProvider } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import { Stack, ThemeProvider } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/features/auth/auth-store'
import { useRefresh } from '@/features/auth/use-auth'
import { queryClient } from '@/lib/query-client'
import { navigationTheme } from '../styles/theme/navigation'

import '../styles/global.css'

const REFRESH_TOKEN_KEY = '@forge:refresh-token'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  })
  const [checkingAuth, setCheckingAuth] = useState(true)
  const refresh = useRefresh()
  const { clearSession } = useAuthStore()

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hide()
    }
  }, [loaded, error])

  // Cold-start session check (APP-04 §3):
  // If a stored refresh token exists, attempt a silent refresh.
  // On success → user is authenticated, stay on the requested route.
  // On failure or no token → clear state and let the router land on sign-in.
  useEffect(() => {
    let cancelled = false

    const checkSession = async () => {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY)

      if (!refreshToken) {
        // No stored session — unauthenticated, router will land on sign-in.
        if (!cancelled) {
          setCheckingAuth(false)
        }
        return
      }

      try {
        await refresh.mutateAsync()
        if (!cancelled) {
          setCheckingAuth(false)
        }
      } catch {
        // Refresh failed — session is dead.
        if (!cancelled) {
          clearSession()
          setCheckingAuth(false)
        }
      }
    }

    checkSession()

    return () => {
      cancelled = true
    }
  }, [refresh, clearSession])

  if (!loaded && !error) {
    return null
  }

  // While checking auth on cold start, show nothing (splash screen covers).
  if (checkingAuth) {
    return null
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={navigationTheme}>
        <Stack />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
