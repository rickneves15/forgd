import { DarkTheme } from 'expo-router'
import { Platform } from 'react-native'

import { colors } from './colors'

export const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.base,
    card: colors.surface,
    text: colors.primary,
    border: colors.subtle,
    notification: colors.danger,
  },
  fonts: {
    ...DarkTheme.fonts,
    ...Platform.select({
      web: {
        regular: { fontFamily: 'Inter_400Regular', fontWeight: '400' as const },
        medium: { fontFamily: 'Inter_500Medium', fontWeight: '500' as const },
        bold: { fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
        heavy: { fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
      },
      default: {
        regular: { fontFamily: 'Inter_400Regular', fontWeight: '400' as const },
        medium: { fontFamily: 'Inter_500Medium', fontWeight: '500' as const },
        bold: { fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
        heavy: { fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
      },
    }),
  },
}
