import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'expo-router'
import { Controller, type UseFormReturn, useForm } from 'react-hook-form'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Text as ForgdText } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import { type SignUpInput, signUpSchema } from './schemas'
import { useRegister } from './use-auth'

type FieldInputProps = Partial<
  Omit<
    React.ComponentProps<typeof Input>,
    'onChange' | 'onBlur' | 'value' | 'name'
  >
>

function Field({
  control,
  name,
  label,
  placeholder,
  inputProps,
  errorMessage,
}: {
  control: UseFormReturn<SignUpInput>['control']
  name: keyof SignUpInput
  label: string
  placeholder: string
  inputProps?: FieldInputProps
  errorMessage?: string | null
}) {
  return (
    <View className="mb-5 w-full">
      <Label className="mb-2">{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <View>
            <Input
              {...inputProps}
              {...field}
              placeholder={placeholder}
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

export function SignUpScreen() {
  const router = useRouter()
  const register = useRegister()

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  })

  const password = watch('password')
  const confirmPassword = watch('confirmPassword')
  const passwordsDiffer = password !== confirmPassword

  const onSubmit = (data: SignUpInput) => {
    const { confirmPassword: _confirmPassword, ...payload } = data
    register.mutate(payload)
  }

  return (
    <View className="flex-1 bg-base">
      <View className="flex-1 items-center justify-center px-6">
        <View className="mb-8 w-full">
          <ForgdText className="font-inter-bold text-display text-primary">
            Join Forgd
          </ForgdText>
          <ForgdText className="mt-2 text-center font-inter-regular text-body text-secondary">
            Start building your next project
          </ForgdText>
        </View>

        <Field
          control={control}
          name="username"
          label="Username"
          placeholder="username"
          inputProps={{
            autoCapitalize: 'none',
            autoComplete: 'username',
            returnKeyType: 'next',
          }}
          errorMessage={errors.username?.message ?? null}
        />

        <Field
          control={control}
          name="email"
          label="Email"
          placeholder="name@example.com"
          inputProps={{
            autoCapitalize: 'none',
            autoComplete: 'email',
            keyboardType: 'email-address',
            returnKeyType: 'next',
          }}
          errorMessage={errors.email?.message ?? null}
        />

        <Field
          control={control}
          name="password"
          label="Password"
          placeholder="••••••••"
          inputProps={{
            secureTextEntry: true,
            autoComplete: 'new-password',
            returnKeyType: 'next',
          }}
          errorMessage={
            errors.password?.message ??
            (passwordsDiffer ? 'Passwords do not match' : null)
          }
        />

        <Field
          control={control}
          name="confirmPassword"
          label="Confirm Password"
          placeholder="••••••••"
          inputProps={{
            secureTextEntry: true,
            autoComplete: 'new-password',
            returnKeyType: 'next',
          }}
          errorMessage={passwordsDiffer ? 'Passwords do not match' : null}
        />

        <Field
          control={control}
          name="college"
          label="College (optional)"
          placeholder="e.g. MIT"
          inputProps={{
            autoCapitalize: 'words',
            autoComplete: 'organization',
            returnKeyType: 'done',
          }}
          errorMessage={errors.college?.message ?? null}
        />

        {register.isError && register.error && (
          <View className="mb-6 w-full rounded-md border border-destructive/30 bg-destructive/10 px-3 py-3">
            <Text className="text-destructive text-sm">
              {registerErrorMessage(register.error)}
            </Text>
          </View>
        )}

        <Button
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting || register.isPending}
          className="mb-4 w-full"
        >
          {register.isPending ? (
            <View className="flex-row items-center gap-1">
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text className="font-medium text-sm">Creating account…</Text>
            </View>
          ) : (
            <Text className="font-medium text-sm">Sign up</Text>
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
          <Text className="text-secondary text-sm">
            Already have an account?
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/sign-in')}
            className="flex-row items-center gap-0.5"
          >
            <Text className="font-medium text-accent text-sm">Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

function registerErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code
    if (code === 'EMAIL_TAKEN') {
      return 'This email is already registered.'
    }
    if (code === 'USERNAME_TAKEN') {
      return 'This username is taken.'
    }
  }
  return 'Something went wrong, try again.'
}
