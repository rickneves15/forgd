import { Stack, ThemeProvider } from 'expo-router'
import { navigationTheme } from '@/styles/theme/navigation'

// Layout for the (auth) route group: sign-up / onboarding screens live in a
// their own stack so the back button behaves correctly per entry context
// (APP-05 §3: no back button on the signup path, back arrow from Settings).
export default function AuthLayout() {
  return (
    <ThemeProvider value={navigationTheme}>
      <Stack />
    </ThemeProvider>
  )
}
