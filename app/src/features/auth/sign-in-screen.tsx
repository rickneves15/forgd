import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { Controller, type UseFormReturn, useForm } from 'react-hook-form'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Text as ForgdText } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { type SignInInput, signInSchema } from './schemas'
import { useLogin } from './use-auth'

function EmailField({
  control,
  errorMessage,
}: {
  control: UseFormReturn<SignInInput>['control']
  errorMessage: string | undefined
}) {
  return (
    <View className="mb-6 w-full">
      <Label className="mb-2">Email</Label>
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <View>
            <Input
              {...field}
              placeholder="name@example.com"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              returnKeyType="next"
              className={cn(errorMessage ? 'border-destructive' : '')}
            />
            {errorMessage && (
              <Text className="mt-1 text-destructive text-sm">
                {errorMessage}
              </Text>
            )}
          </View>
        )}
      />
    </View>
  )
}

function PasswordField({
  control,
  errorMessage,
}: {
  control: UseFormReturn<SignInInput>['control']
  errorMessage: string | undefined
}) {
  return (
    <View className="mb-6 w-full">
      <Label className="mb-2">Password</Label>
      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <View>
            <Input
              {...field}
              placeholder="••••••••"
              secureTextEntry
              autoComplete="current-password"
              returnKeyType="done"
              className={cn(errorMessage ? 'border-destructive' : '')}
            />
            {errorMessage && (
              <Text className="mt-1 text-destructive text-sm">
                {errorMessage}
              </Text>
            )}
          </View>
        )}
      />
    </View>
  )
}

export function SignInScreen() {
  const router = useRouter()
  const login = useLogin()

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = (data: SignInInput) => {
    login.mutate(data)
  }

  return (
    <View className="flex-1 bg-base">
      <View className="flex-1 items-center justify-center px-6">
        <View className="mb-8 w-full">
          <ForgdText className="font-inter-bold text-display text-primary">
            Welcome back
          </ForgdText>
          <ForgdText className="mt-2 text-center font-inter-regular text-body text-secondary">
            Sign in to your account
          </ForgdText>
        </View>

        <EmailField control={control} errorMessage={errors.email?.message} />
        <PasswordField
          control={control}
          errorMessage={errors.password?.message}
        />

        {login.isError && (
          <View className="mb-6 w-full rounded-md border border-destructive/30 bg-destructive/10 px-3 py-3">
            <Text className="text-destructive text-sm">
              Email or password is incorrect.
            </Text>
          </View>
        )}

        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting || login.isPending}
          className="mb-4 w-full"
        >
          {login.isPending ? (
            <View className="flex-row items-center gap-1">
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text className="font-medium text-sm">Signing in…</Text>
            </View>
          ) : (
            <Text className="font-medium text-sm">Sign in</Text>
          )}
        </Button>

        <View className="mb-6 w-full">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 border-subtle border-b" />
            <Text className="mx-2 text-secondary text-sm">
              or continue with
            </Text>
            <View className="flex-1 border-subtle border-b" />
          </View>
        </View>

        <Button
          onPress={() => {
            // Google OAuth handled via openAuthSessionAsync from this screen
          }}
          variant="outline"
          className="mb-8 w-full"
        >
          <View className="flex-row items-center gap-2">
            <View className="h-5 w-5 rounded-sm border border-subtle" />
            <Text className="font-medium text-secondary text-sm">
              Continue with Google
            </Text>
          </View>
        </Button>

        <View className="flex-row justify-center gap-1">
          <Text className="text-secondary text-sm">Don't have an account?</Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/sign-up')}
            className="flex-row items-center gap-0.5"
          >
            <Text className="font-medium text-accent text-sm">Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
