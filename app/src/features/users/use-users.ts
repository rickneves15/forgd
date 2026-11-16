import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMeApi, updateInterestsApi } from './api'

// GET /me (SPEC-20 §4.1). Returns the current user's id.
export function useMeQuery() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => getMeApi(),
  })
}

// PUT /users/me/interests (SPEC-05 §4.1). Saves interest tags.
export function useUpdateInterestsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (interests: string[]) => updateInterestsApi({ interests }),

    onMutate: async (newInterests) => {
      await queryClient.cancelQueries({ queryKey: ['me'] })

      const previous = queryClient.getQueryData<{ interests?: string[] }>([
        'me',
      ])

      queryClient.setQueryData(['me'], (old: unknown) => {
        const current = old as { interests?: string[] } | undefined
        return { ...current, interests: newInterests }
      })

      return { previous }
    },

    onError: (_err, _newInterests, context) => {
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
