import { TouchableOpacity } from 'react-native'
import { Text } from '@/components/ui/text'
import { cn } from '@/lib/utils'

// Toggleable interest chip (APP-05 §6). Selected state uses the weld-orange
// accent token; unselected uses the surface/muted tokens. No raw hex values.
function Chip({
  label,
  selected,
  onPress,
  className,
}: {
  label: string
  selected: boolean
  onPress: () => void
  className?: string
}) {
  return (
    <TouchableOpacity
      className={cn(
        'flex-row items-center justify-center gap-2 rounded-md border px-3 py-1.5 transition-all duration-200 active:opacity-80',
        selected
          ? 'border-accent bg-accent text-accent-foreground shadow-black/10 shadow-sm'
          : 'border-subtle bg-surface text-secondary',
        className,
      )}
      onPress={onPress}
    >
      <Text className="font-medium text-sm">{label}</Text>
    </TouchableOpacity>
  )
}

export { Chip }
