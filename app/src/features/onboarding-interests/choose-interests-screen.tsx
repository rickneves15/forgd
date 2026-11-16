import { ArrowLeft } from 'lucide-react-native'
import {
  ActivityIndicator,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { cn } from '@/lib/utils'
import { colors } from '@/styles/theme/colors'
import { useOnboardingInterests } from './use-onboarding-interests'

export function ChooseInterestsScreen() {
  const {
    selected,
    error,
    isPending,
    isSignupPath,
    toggleInterest,
    handleSave,
    goBack,
    INTEREST_CHIPS,
  } = useOnboardingInterests()

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
              onPress={goBack}
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
          disabled={isPending}
        >
          {isPending ? (
            <View className="flex-row items-center gap-1">
              <ActivityIndicator size="small" color={colors.primary} />
              <Text className="font-medium text-sm opacity-50">Skipping…</Text>
            </View>
          ) : (
            <Text className="font-medium text-accent text-sm">Skip</Text>
          )}
        </TouchableOpacity>

        {/* Continue button */}
        <Button onPress={handleSave} disabled={isPending} className="w-full">
          {isPending ? (
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
