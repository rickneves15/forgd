import { useQueryClient } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { useUpdateInterests } from '@/hooks/use-update-interests'

// Fixed interest tags from SPEC-05 §4.3, mapped to display labels.
export const INTEREST_CHIPS: { value: string; label: string }[] = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'btech', label: 'B.Tech' },
  { value: 'mtech', label: 'M.Tech' },
  { value: 'it_cs', label: 'IT / CS' },
  { value: 'ente', label: 'Entrepreneurship' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'mechanical', label: 'Mechanical' },
  { value: 'civil', label: 'Civil' },
]

// PUT /users/me/interests (SPEC-05 §4.1). Manages interest-selection state,
// optimistic mutation via useUpdateInterests, and navigation per entry context
// (APP-05 §3: no back button on the signup path, back arrow from Settings).
export function useOnboardingInterests() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const mutation = useUpdateInterests()

  // Expo Router strips route-group parentheses, so `usePathname()` returns
  // `/choose-interests` for both the (auth) signup stack and the Profile
  // stack. Use a query param to distinguish: Settings pushes
  // `/choose-interests?from=settings`; the signup path uses the plain route.
  const { from } = useLocalSearchParams()
  const isSignupPath = from !== 'settings'

  // Pre-populate from the cached ['me'] user object when entered from
  // Settings (APP-05 §4.1); otherwise start empty.
  const cachedInterests =
    queryClient.getQueryData<{ interests?: string[] }>(['me'])?.interests ?? []
  const [selected, setSelected] = useState<string[]>(cachedInterests)

  const toggleInterest = async (value: string) => {
    setError(null)
    const previous = selected
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value]
    setSelected(next)
    try {
      await mutation.mutateAsync(next)
    } catch {
      // Roll back the local selection so the UI matches the server on failure.
      setSelected(previous)
      setError('Something went wrong, try again.')
    }
  }

  const handleSave = async () => {
    setError(null)
    try {
      await mutation.mutateAsync(selected)
      if (isSignupPath) {
        router.replace('/projects')
      } else {
        router.back()
      }
    } catch (_err: unknown) {
      setError('Something went wrong, try again.')
    }
  }

  const goBack = () => {
    router.back()
  }

  return {
    selected,
    error,
    isPending: mutation.isPending,
    isSignupPath,
    toggleInterest,
    handleSave,
    goBack,
    INTEREST_CHIPS,
  }
}
