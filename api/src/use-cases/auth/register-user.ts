import { hash } from 'bcryptjs'
import type { FastifyReply } from 'fastify'
import { BCRYPT_SALT_ROUNDS } from '@/constants'
import {
  createUser,
  findUserByEmailOrUsername,
} from '@/db/repositories/users-repository'
import { BadRequestError } from '@/http/errors/bad-request-error'
import { ConflictError } from '@/http/errors/conflict-error'
import { issueTokens } from './issue-tokens'

type RegisterUserInput = {
  username: string
  email: string
  password: string
  college?: string
}

export const registerUser = async (
  reply: FastifyReply,
  input: RegisterUserInput,
) => {
  const { username, email, password, college } = input

  const userWithSameEmailOrUsername = await findUserByEmailOrUsername(
    email,
    username,
  )

  // Distinct codes let a client tell an existing email apart from a taken
  // username without parsing the message text (SPEC-01).
  if (userWithSameEmailOrUsername) {
    if (userWithSameEmailOrUsername.email === email) {
      throw new ConflictError('Email already registered', 'EMAIL_TAKEN')
    }

    throw new ConflictError('Username already taken', 'USERNAME_TAKEN')
  }

  const passwordHash = await hash(password, BCRYPT_SALT_ROUNDS)

  const user = await createUser({ username, email, passwordHash, college })

  if (!user) {
    throw new BadRequestError('Failed to create user')
  }

  const { accessToken, refreshToken } = await issueTokens(reply, {
    userId: user.id,
  })

  return { accessToken, refreshToken, user }
}
