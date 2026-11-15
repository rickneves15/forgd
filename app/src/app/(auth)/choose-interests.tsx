import { useQueryClient } from '@tanstack/react-query'
import { usePathname, useRouter } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
import { useState } from 'react'
import {
  ActivityIndicator,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { useUpdateInterests } from '@/hooks/use-update-interests'
import { cn } from '@/lib/utils'
import { colors } from '@/styles/theme/colors'

// Fixed interest tags from SPEC-05 §4.3, mapped to display labels.
const INTEREST_CHIPS: { value: string; label: string }[] = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'btech', label: 'B.Tech' },
  { value: 'mtech', label: 'M.Tech' },
  { value: 'it_cs', label: 'IT / CS' },
  { value: 'ente', label: 'Entrepreneurship' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'mechanical', label: 'Mechanical' },
  { value: 'civil', label: 'Civil' },
]

export default function ChooseInterests() {
  const router = useRouter()
  const pathname = usePathname()
  const isSignupPath = pathname.includes('(auth)')
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const mutation = useUpdateInterests()

  // Pre-populate from the cached ['me'] user object when entered from
  // Settings (APP-05 §4.1); otherwise start empty.
  const cachedInterests =
    queryClient.getQueryData<{ interests?: string[] }>(['me'])?.interests ?? []
  const [selected, setSelected] = useState<string[]>(cachedInterests)

  const toggleInterest = (value: string) => {
    setError(null)
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value]
    setSelected(next)
    mutation.mutate(next)
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
    } catch (err: unknown) {
      setError(
        err instanceof Error && 'code' in err && err.code === 'VALIDATION_ERROR'
          ? 'Something went wrong, try again.'
          : 'Something went wrong, try again.',
      )
    }
  }

  return (
    <View className="flex-1 bg-base">
      <View
        className={cn(
          'flex-1 items-center justify-center px-6',
          Platform.select({
            web: 'mx-auto max-w-[480px]',
          }),
        )}
      >
        {/* Header */}
        <View className="mb-8 w-full">
          {!isSignupPath && (
            <TouchableOpacity
              onPress={() => router.back()}
              className="mb-6 flex-row items-center gap-1"
            >
              <ArrowLeft size={18} className="text-secondary" />
              <Text className="font-medium text-secondary text-sm">Back</Text>
            </TouchableOpacity>
          )}
          <Text className="font-inter-bold text-display text-primary">
            What are you interested in?
          </Text>
          <Text className="mt-2 text-center font-inter-regular text-body text-secondary">
            Pick your departments and topics. We'll use them to pre-filter your
            Projects feed. You can change this anytime in Settings.
          </Text>
        </View>

        {/* Error banner */}
        {error && (
          <View className="mb-6 w-full rounded-md border border-destructive/30 bg-destructive/10 px-3 py-3">
            <Text className="text-destructive text-sm">{error}</Text>
          </View>
        )}

        {/* Chip grid */}
        <View className="mb-8 w-full">
          <View className="grid grid-cols-2 gap-3">
            {INTEREST_CHIPS.map((chip) => (
              <Chip
                key={chip.value}
                label={chip.label}
                selected={selected.includes(chip.value)}
                onPress={() => toggleInterest(chip.value)}
              />
            ))}
          </View>
        </View>

        {/* Skip link */}
        <TouchableOpacity
          onPress={handleSave}
          className="mb-4 flex-row items-center justify-center gap-1"
          disabled={mutation.isPending}
        >
          <Text
            className={`font-medium text-sm ${mutation.isPending ? 'opacity-50' : 'text-accent'}`}
          >
            Skip
          </Text>
        </TouchableOpacity>

        {/* Continue button */}
        <Button
          onPress={handleSave}
          disabled={mutation.isPending}
          className="w-full"
        >
          {mutation.isPending ? (
            <View className="flex-row items-center gap-1">
              <ActivityIndicator size="small" color={colors.primary} />
              <Text className="font-medium text-sm">Saving…</Text>
            </View>
          ) : (
            <Text className="font-medium text-sm">Continue</Text>
          )}
        </Button>
      </View>
    </View>
  )
}
