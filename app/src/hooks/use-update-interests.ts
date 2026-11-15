import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/http/api-client'

// PUT /users/me/interests (SPEC-05 §4.1). Optimistically updates the cached
// `['me']` user object's `interests` field on tap-to-select, then rolls back
// if the request fails (APP-05 §4.2).
export function useUpdateInterests() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (interests: string[]) =>
      apiClient.put('/users/me/interests', { interests }),

    onMutate: async (newInterests) => {
      // Cancel outgoing refetches so they don't clobber our optimistic write.
      await queryClient.cancelQueries({ queryKey: ['me'] })

      const previous = queryClient.getQueryData<{ interests?: string[] }>([
        'me',
      ])

      // Optimistically update the cached user object's interests field.
      queryClient.setQueryData(['me'], (old: unknown) => {
        const current = old as { interests?: string[] } | undefined
        return { ...current, interests: newInterests }
      })

      return { previous }
    },

    onError: (_err, _newInterests, context) => {
      // Roll back to the pre-mutation snapshot.
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['me'], context.previous)
      } else {
        queryClient.removeQueries({ queryKey: ['me'] })
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}
