import { compare } from 'bcryptjs'
import type { FastifyReply } from 'fastify'
import { UnauthorizedError } from '@/http/errors/unauthorized-error'
import { findUserByEmail } from '@/repositories/users-repository'
import { issueTokens } from './issue-tokens'

type LoginUserInput = {
  email: string
  password: string
}

export const loginUser = async (reply: FastifyReply, input: LoginUserInput) => {
  const user = await findUserByEmail(input.email)

  // Unknown email, Google-only account, and wrong password all return the
  // same 401 — the response never reveals whether an account exists
  // (SPEC-02). The two branches below intentionally share the message.
  if (!user?.passwordHash) {
    throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS')
  }

  const isPasswordValid = await compare(input.password, user.passwordHash)
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid credentials', 'INVALID_CREDENTIALS')
  }

  const { accessToken, refreshToken } = await issueTokens(reply, {
    userId: user.id,
  })

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      college: user.college,
    },
  }
}
