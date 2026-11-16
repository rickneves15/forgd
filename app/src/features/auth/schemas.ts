import { z } from 'zod'

// Sign up schema mirrors SPEC-01 §4.3 client-side for instant feedback.
// `confirmPassword` is client-only and not sent to the API.
export const signUpSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  college: z
    .string()
    .max(120, 'College must be at most 120 characters')
    .optional(),
})

export const signInSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>

// Fields actually sent to the API (confirmPassword is stripped).
export type RegisterPayload = {
  username: string
  email: string
  password: string
  college?: string
}

export type LoginPayload = {
  email: string
  password: string
}
