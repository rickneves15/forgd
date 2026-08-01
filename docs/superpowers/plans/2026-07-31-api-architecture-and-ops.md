# API Architecture & Ops Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the Fastify API a layered structure (use-cases + repositories), standardize the 404 response, and add a `/health` endpoint so Railway can probe the API — plus record the design decisions in ADR-005.

**Architecture:** Routes stay thin (parse request, call a use-case, send response). Business logic moves from `src/functions/` and inline route handlers into `src/use-cases/auth/*`; data access moves into `src/repositories/*`. `GET /health` pings Postgres. Unknown routes return the same `{ code, message }` shape every error already uses.

**Tech Stack:** Fastify 5, Drizzle ORM, `@fastify/rate-limit`, zod, vitest.

> All commands run from the `api/` directory unless noted otherwise.

---

### Task 1: Write ADR-005 documenting the design decisions

**Files:**
- Create: `docs/adr/ADR-005-api-security-and-layered-architecture.md`

No code changes. Record the decisions made in the design review so the code that follows (and future work) has an anchor. Follow the exact structure of `docs/adr/ADR-004-debug-request-response-logging.md` (Status / Date / Context / Decision / Rationale / Consequences).

- [ ] **Step 1: Create the ADR file**

```markdown
# ADR-005: API Security & Layered Architecture

**Status:** Accepted
**Date:** 2026-07-31

## Context

The API had no security hardening beyond CORS and the login was a single
monolithic route file. As the route count grows (Projects, Groups, Profile are
next), we need a predictable way to split business logic from HTTP handling, a
health endpoint for Railway to probe, and a consistent response shape for
unknown routes.

## Decision

- **No URL versioning (`/v1`).** The API is consumed only by the Forgd mobile
  client, which ships with the server. A version prefix adds ceremony with no
  contract-stability benefit yet; one can be added if an external consumer
  ever appears.
- **Layered structure:** routes → use-cases → repositories.
  - `src/http/routes/*` — HTTP concerns only: zod schema, calling one
    use-case, serializing the response.
  - `src/use-cases/*` — business rules (email-vs-username conflicts, token
    rotation, password hashing), throws `HttpError`s.
  - `src/repositories/*` — data access (drizzle queries), no business rules.
  - Errors live in `src/http/errors/` so both routes and use-cases can import
    them without a use-case depending on the routes layer.
- **Security plugins** (`@fastify/helmet`, `@fastify/cors`,
  `@fastify/rate-limit`, `@fastify/throttle`):
  - Helmet with `contentSecurityPolicy: false` — the only HTML served is the
    Scalar `/docs` page, which needs inline scripts/styles.
  - Light global rate limit (100 req/min/IP) with the built-in in-memory
    store. Per-route hardening (login brute-force) and a Redis store are
    deferred until auth load justifies them.
  - Response-send throttle at 5 MB/s as an abuse guard.
  - `trustProxy` is enabled in production so rate limiting keys on the real
    client IP behind Railway's reverse proxy.
- **`GET /health`** returns `200 { status: 'ok', database: 'ok' }` when a
  `SELECT 1` against Postgres succeeds, `503 { status: 'degraded',
  database: 'down' }` otherwise. Excluded from the global rate limit so
  Railway's frequent probes never trip it.
- **Standardized 404:** unknown routes return
  `404 { code: 'NOT_FOUND', message: 'Route not found' }` instead of
  Fastify's default `{ message, error, statusCode }` body.

## Rationale

- The route files were growing business logic inline (register, login, refresh
  each had SQL + rules in the handler), which does not scale past auth.
  Use-cases/repositories is the boring, conventional split; nothing heavier
  (no DI container, no CQRS) is justified by the current scope.
- One error shape everywhere (`{ code, message }`) is what the client already
  parses for 4xx/5xx; Fastify's default 404 body is the only outlier.
- Railway probes the health endpoint every few seconds; a rate limit on it
  would cause false unhealthy signals.

## Consequences

- All new business logic goes in `src/use-cases/`, all SQL in
  `src/repositories/`. Routes do not import `@/db` anymore — the one
  exception is `GET /health`, which pings Postgres directly as an ops probe
  (no business logic to wrap in a use-case; a repository for `SELECT 1`
  would be ceremony).
- `src/functions/` is removed; its content moves into the use-case layer.
- `/health` is public and unauthenticated — it reveals only whether the
  service and DB are up, nothing else.
- The in-memory rate limit resets on restart and does not share across
  instances; acceptable at current single-instance scale.
```

- [ ] **Step 2: Commit**

```bash
git add docs/adr/ADR-005-api-security-and-layered-architecture.md
git commit -m "docs(adr): document security plugins and layered architecture"
```

---

### Task 2: Add `GET /health`

**Files:**
- Create: `src/http/routes/health.ts`
- Create: `src/http/routes/health.test.ts`
- Modify: `src/http/app.ts` (register the route)

- [ ] **Step 1: Write the failing test**

`src/http/routes/health.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { buildTestApp } from '@test/helpers/app'

describe('GET /health', () => {
  const app = buildTestApp()

  it('returns 200 with database ok when Postgres responds', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' })

    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual({ status: 'ok', database: 'ok' })
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/http/routes/health.test.ts`
Expected: FAIL — `Route GET:/health not found` → 404 instead of 200.

- [ ] **Step 3: Create the health route**

`src/http/routes/health.ts`:

```ts
import { sql } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '@/db'

export const health: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/health',
    {
      // Railway probes this endpoint every few seconds; it must never trip
      // the global rate limit (see ADR-005).
      config: { rateLimit: false },
      schema: {
        summary: "Reports the API's health, including a Postgres ping.",
        tags: ['System'],
        response: {
          200: z.object({
            status: z.literal('ok'),
            database: z.literal('ok'),
          }),
          503: z.object({
            status: z.literal('degraded'),
            database: z.literal('down'),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        await db.execute(sql`SELECT 1`)

        return { status: 'ok', database: 'ok' }
      } catch (error) {
        request.log.error({ err: error }, 'Health check: database ping failed')

        return reply.status(503).send({
          status: 'degraded',
          database: 'down',
        })
      }
    },
  )
}
```

- [ ] **Step 4: Register the route in app.ts**

In `src/http/app.ts`, add the import after the other route imports:

```ts
import { health } from './routes/health'
```

And register it with the other routes (after `register(userMe)`):

```ts
  app.register(userMe)
  app.register(health)
```

`/health` pings `@/db` directly — it is the documented exception to
"routes do not import `@/db`" (see ADR-005).

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm exec vitest run src/http/routes/health.test.ts`
Expected: PASS.

- [ ] **Step 6: Verify typecheck and lint**

Run: `pnpm exec tsc --noEmit && pnpm exec biome check src test`
Expected: no errors, no fixes applied.

- [ ] **Step 7: Commit**

```bash
git add src/http/routes/health.ts src/http/routes/health.test.ts src/http/app.ts
git commit -m "feat(api): add /health endpoint with database ping"
```

---

### Task 3: Standardize the 404 response

**Files:**
- Create: `src/http/app.test.ts`
- Modify: `src/http/app.ts`

Fastify's default unknown-route body is `{ message, error, statusCode }`; every
other error in the API is `{ code, message }`. A `setNotFoundHandler` fixes the
outlier.

- [ ] **Step 1: Write the failing test**

`src/http/app.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { buildTestApp } from '@test/helpers/app'

describe('404 handler', () => {
  const app = buildTestApp()

  it('returns the standardized NOT_FOUND body for unknown routes', async () => {
    const res = await app.inject({ method: 'GET', url: '/nonexistent-route' })

    expect(res.statusCode).toBe(404)
    expect(res.json()).toEqual({
      code: 'NOT_FOUND',
      message: 'Route not found',
    })
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/http/app.test.ts`
Expected: FAIL — the body is `{ message, error, statusCode }`, not
`{ code, message }`.

- [ ] **Step 3: Add the not-found handler**

In `src/http/app.ts`, right after `app.setErrorHandler(errorHandler)`, add:

```ts
  app.setNotFoundHandler((request, reply) => {
    request.log.warn(
      { method: request.method, url: request.url },
      'Route not found',
    )

    return reply.status(404).send({
      code: 'NOT_FOUND',
      message: 'Route not found',
    })
  })
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/http/app.test.ts`
Expected: PASS.

- [ ] **Step 5: Run the full suite to confirm nothing regressed**

Run: `pnpm test`
Expected: all tests pass (27 tests total, including the new health + 404).

- [ ] **Step 6: Commit**

```bash
git add src/http/app.test.ts src/http/app.ts
git commit -m "feat(api): return standardized NOT_FOUND body for unknown routes"
```

---

### Task 4: Move HTTP errors out of the routes layer

**Files:**
- Move: `src/http/routes/_errors/http-error.ts` → `src/http/errors/http-error.ts`
- Move: `src/http/routes/_errors/schema.ts` → `src/http/errors/schema.ts`
- Move: `src/http/routes/_errors/errors/bad-request-error.ts` → `src/http/errors/bad-request-error.ts`
- Move: `src/http/routes/_errors/errors/conflict-error.ts` → `src/http/errors/conflict-error.ts`
- Move: `src/http/routes/_errors/errors/not-found.ts` → `src/http/errors/not-found-error.ts`
- Move: `src/http/routes/_errors/errors/unauthorized-error.ts` → `src/http/errors/unauthorized-error.ts`
- Modify: all files importing the old paths (see Step 2)

The move makes errors importable by `src/use-cases/*` without a use-case
depending on the routes layer (ADR-005). The move also flattens the
`errors/errors` nesting and renames `not-found.ts` to `not-found-error.ts` so
the class name matches the filename.

- [ ] **Step 1: Move the files**

```bash
mkdir -p src/http/errors
git mv src/http/routes/_errors/http-error.ts src/http/errors/http-error.ts
git mv src/http/routes/_errors/schema.ts src/http/errors/schema.ts
git mv src/http/routes/_errors/errors/bad-request-error.ts src/http/errors/bad-request-error.ts
git mv src/http/routes/_errors/errors/conflict-error.ts src/http/errors/conflict-error.ts
git mv src/http/routes/_errors/errors/not-found.ts src/http/errors/not-found-error.ts
git mv src/http/routes/_errors/errors/unauthorized-error.ts src/http/errors/unauthorized-error.ts
git rm -r src/http/routes/_errors
```

- [ ] **Step 2: Update every import of the old paths**

The files below import from `_errors` and must be updated. Use `@/http/errors/...`
instead of the relative `_errors` path, and `.js` extensions where the existing
import uses one:

- `src/http/error-handler.ts` — `./routes/_errors/http-error` →
  `@/http/errors/http-error`
- `src/http/middlewares/auth.ts` — `../routes/_errors/errors/unauthorized-error`
  → `@/http/errors/unauthorized-error`
- `src/http/routes/auth/register.ts` — `../_errors/errors/bad-request-error`,
  `../_errors/errors/conflict-error`, `../_errors/schema` →
  `@/http/errors/bad-request-error`, `@/http/errors/conflict-error`,
  `@/http/errors/schema`
- `src/http/routes/auth/login.ts` — `../_errors/errors/unauthorized-error.js`,
  `../_errors/schema.js` → `@/http/errors/unauthorized-error`,
  `@/http/errors/schema`
- `src/http/routes/auth/refresh.ts` — `../_errors/errors/unauthorized-error.js`,
  `../_errors/schema.js` → `@/http/errors/unauthorized-error`,
  `@/http/errors/schema`
- `src/http/routes/auth/logout.ts` — `../_errors/schema` →
  `@/http/errors/schema`

Verify no references to `_errors` remain:

```bash
grep -rn "_errors" src || echo "no references remain"
```

- [ ] **Step 3: Run the full suite**

Run: `pnpm test`
Expected: all tests pass (27).

- [ ] **Step 4: Verify typecheck and lint**

Run: `pnpm exec tsc --noEmit && pnpm exec biome check src test`
Expected: no errors, no fixes applied.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor(api): move http errors out of routes layer"
```

---

### Task 5: Create the repositories layer

**Files:**
- Create: `src/repositories/users-repository.ts`
- Create: `src/repositories/refresh-tokens-repository.ts`

Pure data access. No business rules; a "not found" query returns `null`, and a
failed insert returns `null` — callers decide what that means. Nothing imports
these yet; Task 6 wires them up.

- [ ] **Step 1: Create `src/repositories/users-repository.ts`**

```ts
import { eq, or } from 'drizzle-orm'
import { db } from '@/db'
import { users } from '@/db/schema'

export const findUserByEmail = async (email: string) => {
  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      college: users.college,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  return user ?? null
}

// Used by register to detect an existing email OR username in one query
// (SPEC-01); returns the row's email so the caller can tell which one hit.
export const findUserByEmailOrUsername = async (
  email: string,
  username: string,
) => {
  const [user] = await db
    .select({ email: users.email })
    .from(users)
    .where(or(eq(users.email, email), eq(users.username, username)))
    .limit(1)

  return user ?? null
}

export const createUser = async (data: {
  username: string
  email: string
  passwordHash: string
  college?: string
}) => {
  const [user] = await db.insert(users).values(data).returning({
    id: users.id,
    username: users.username,
    email: users.email,
    college: users.college,
  })

  return user ?? null
}
```

- [ ] **Step 2: Create `src/repositories/refresh-tokens-repository.ts`**

```ts
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { refreshTokens } from '@/db/schema'

export const insertRefreshToken = async (data: {
  userId: string
  tokenHash: string
  expiresAt: Date
}) => {
  await db.insert(refreshTokens).values(data)
}

export const findRefreshTokenByHash = async (tokenHash: string) => {
  const [token] = await db
    .select({
      userId: refreshTokens.userId,
      expiresAt: refreshTokens.expiresAt,
    })
    .from(refreshTokens)
    .where(eq(refreshTokens.tokenHash, tokenHash))
    .limit(1)

  return token ?? null
}

export const deleteRefreshTokensByUserId = async (userId: string) => {
  await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId))
}
```

- [ ] **Step 3: Verify typecheck**

Run: `pnpm exec tsc --noEmit && pnpm exec biome check src test`
Expected: no errors, no fixes applied. The existing suite is untouched
(no code paths changed).

- [ ] **Step 4: Commit**

```bash
git add src/repositories
git commit -m "feat(api): add users and refresh-tokens repositories"
```

---

### Task 6: Create the auth use-cases and refactor the routes

**Files:**
- Create: `src/use-cases/auth/issue-tokens.ts`
- Create: `src/use-cases/auth/register-user.ts`
- Create: `src/use-cases/auth/login-user.ts`
- Create: `src/use-cases/auth/logout-user.ts`
- Create: `src/use-cases/auth/refresh-session.ts`
- Modify: `src/http/routes/auth/register.ts`
- Modify: `src/http/routes/auth/login.ts`
- Modify: `src/http/routes/auth/logout.ts`
- Modify: `src/http/routes/auth/refresh.ts`
- Delete: `src/functions/` (both files)

Behavior-preserving refactor: every route keeps its zod schema and response
shape exactly; the existing integration tests (register, login, logout,
refresh, userMe) are the verification. `issueTokens` replaces
`functions/auth/get-tokens.ts` (same logic, now persisting through the
repository).

- [ ] **Step 1: Create `src/use-cases/auth/issue-tokens.ts`**

```ts
import type { FastifyReply } from 'fastify'
import { generateUUID } from '@/lib/uuid'
import { insertRefreshToken } from '@/repositories/refresh-tokens-repository'
import {
  createTokenPayload,
  getRefreshTokenExpirationDate,
  hashToken,
  type TokenPayloadRequest,
} from '@/utils/auth'

export const issueTokens = async (
  reply: FastifyReply,
  data: TokenPayloadRequest,
) => {
  const payload = createTokenPayload(data)

  const accessToken = await reply.jwtSign(payload)
  // A unique jti per refresh token makes rotation (SPEC-04) work: without it,
  // two tokens signed in the same second are byte-identical (same sub/iat/exp).
  const refreshToken = await reply.refreshJwtSign({
    ...payload,
    jti: generateUUID(),
  })

  await insertRefreshToken({
    userId: data.userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: getRefreshTokenExpirationDate(),
  })

  return {
    accessToken,
    refreshToken,
  }
}
```

- [ ] **Step 2: Create `src/use-cases/auth/register-user.ts`**

```ts
import { hash } from 'bcryptjs'
import type { FastifyReply } from 'fastify'
import { BCRYPT_SALT_ROUNDS } from '@/constants'
import { BadRequestError } from '@/http/errors/bad-request-error'
import { ConflictError } from '@/http/errors/conflict-error'
import {
  createUser,
  findUserByEmailOrUsername,
} from '@/repositories/users-repository'
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
```

- [ ] **Step 3: Create `src/use-cases/auth/login-user.ts`**

```ts
import { compare } from 'bcryptjs'
import type { FastifyReply } from 'fastify'
import { UnauthorizedError } from '@/http/errors/unauthorized-error'
import { findUserByEmail } from '@/repositories/users-repository'
import { issueTokens } from './issue-tokens'

type LoginUserInput = {
  email: string
  password: string
}

export const loginUser = async (
  reply: FastifyReply,
  input: LoginUserInput,
) => {
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
```

- [ ] **Step 4: Create `src/use-cases/auth/logout-user.ts`**

```ts
import { deleteRefreshTokensByUserId } from '@/repositories/refresh-tokens-repository'

export const logoutUser = async (userId: string) => {
  await deleteRefreshTokensByUserId(userId)
}
```

- [ ] **Step 5: Create `src/use-cases/auth/refresh-session.ts`**

```ts
import type { FastifyReply } from 'fastify'
import { UnauthorizedError } from '@/http/errors/unauthorized-error'
import {
  deleteRefreshTokensByUserId,
  findRefreshTokenByHash,
} from '@/repositories/refresh-tokens-repository'
import { hashToken } from '@/utils/auth'
import { issueTokens } from './issue-tokens'

export const refreshSession = async (reply: FastifyReply, token: string) => {
  const tokenHash = hashToken(token)

  const storedToken = await findRefreshTokenByHash(tokenHash)

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new UnauthorizedError(
      'Invalid refresh token',
      'INVALID_REFRESH_TOKEN',
    )
  }

  // Rotation (SPEC-04): revoke every token the user holds, then issue a
  // fresh pair. The presented token is now dead, so a leaked copy can't
  // be replayed after the legitimate client has refreshed.
  await deleteRefreshTokensByUserId(storedToken.userId)

  return issueTokens(reply, { userId: storedToken.userId })
}
```

- [ ] **Step 6: Refactor `src/http/routes/auth/register.ts`**

Replace the imports:

```ts
import { hash } from 'bcryptjs'
import { eq, or } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { BCRYPT_SALT_ROUNDS } from '@/constants'
import { db } from '@/db'
import { users } from '@/db/schema'
import { getTokens } from '@/functions/auth/get-tokens'
import { BadRequestError } from '../_errors/errors/bad-request-error'
import { ConflictError } from '../_errors/errors/conflict-error'
import { errorSchema, validationErrorSchema } from '../_errors/schema'
```

with:

```ts
import { createSelectSchema } from 'drizzle-zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { users } from '@/db/schema'
import { errorSchema, validationErrorSchema } from '@/http/errors/schema'
import { registerUser } from '@/use-cases/auth/register-user'
```

Replace the handler body (everything from `const { username, email, password, college } = request.body` through the `return reply.status(201).send({...})`) with:

```ts
      const { username, email, password, college } = request.body

      const result = await registerUser(reply, {
        username,
        email,
        password,
        college,
      })

      // Fastify defaults to 200 on any response with a body — the spec's 201
      // must be set explicitly (SPEC-01).
      return reply.status(201).send(result)
```

The route's zod `schema` block stays byte-for-byte identical.

- [ ] **Step 7: Refactor `src/http/routes/auth/login.ts`**

Replace the imports:

```ts
import { compare } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '@/db'
import { users } from '@/db/schema'
import { getTokens } from '@/functions/auth/get-tokens.js'
import { UnauthorizedError } from '../_errors/errors/unauthorized-error.js'
import { errorSchema, validationErrorSchema } from '../_errors/schema.js'
```

with:

```ts
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { errorSchema, validationErrorSchema } from '@/http/errors/schema'
import { loginUser } from '@/use-cases/auth/login-user'
```

Replace the handler body (everything between `const { email, password } = request.body` and the closing of the handler) with:

```ts
      return loginUser(reply, { email, password })
```

The route's zod `schema` block stays byte-for-byte identical.

- [ ] **Step 8: Refactor `src/http/routes/auth/logout.ts`**

Replace the imports:

```ts
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { deleteAllTokensByUserId } from '@/functions/auth/delete-all-tokens-by-user-id'
import { auth } from '@/http/middlewares/auth'
import { errorSchema } from '../_errors/schema'
```

with:

```ts
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { errorSchema } from '@/http/errors/schema'
import { auth } from '@/http/middlewares/auth'
import { logoutUser } from '@/use-cases/auth/logout-user'
```

Replace the handler body (everything between `const userId = await request.getCurrentUserId()` and the closing of the handler) with:

```ts
      const userId = await request.getCurrentUserId()

      await logoutUser(userId)

      return { success: true }
```

- [ ] **Step 9: Refactor `src/http/routes/auth/refresh.ts`**

Replace the imports:

```ts
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '@/db'
import { refreshTokens } from '@/db/schema'
import { deleteAllTokensByUserId } from '@/functions/auth/delete-all-tokens-by-user-id.js'
import { getTokens } from '@/functions/auth/get-tokens.js'
import { auth } from '@/http/middlewares/auth.js'
import { hashToken } from '@/utils/auth.js'
import { UnauthorizedError } from '../_errors/errors/unauthorized-error.js'
import { errorSchema } from '../_errors/schema.js'
```

with:

```ts
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { errorSchema } from '@/http/errors/schema'
import { auth } from '@/http/middlewares/auth'
import { refreshSession } from '@/use-cases/auth/refresh-session'
```

Replace the handler body (everything from `const token = await request.validateRefreshToken()` through the `return { accessToken, refreshToken }`) with:

```ts
      // validateRefreshToken extracts and verifies the Bearer token; the
      // use-case hashes it for the DB lookup and rotates the session.
      const token = await request.validateRefreshToken()

      return refreshSession(reply, token)
```

- [ ] **Step 10: Delete the old functions layer**

```bash
git rm -r src/functions
```

Verify nothing references it:

```bash
grep -rn "functions/" src test || echo "no references remain"
```

- [ ] **Step 11: Run the full suite**

Run: `pnpm test`
Expected: all 27 tests pass.

- [ ] **Step 12: Verify typecheck and lint**

Run: `pnpm exec tsc --noEmit && pnpm exec biome check src test`
Expected: no errors, no fixes applied.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "refactor(api): move auth logic into use-cases and repositories"
```

---

## Self-Review

**Spec coverage:**
- ADR-005 documenting decisions → Task 1.
- `/health` with DB ping, excluded from rate limit → Task 2.
- Standardized 404 `{ code, message }` → Task 3.
- Errors moved out of routes layer → Task 4.
- `src/repositories/` → Task 5.
- `src/use-cases/` + routes refactored, `src/functions/` removed → Task 6.
- No `/v1` prefix → covered as an explicit "no" decision in ADR-005 (no code).

**Placeholder scan:** all steps contain concrete code or exact commands; no TBDs.

**Type consistency:** `issueTokens(reply, { userId })` is used identically by
register/login/refresh; repository functions keep the same return shapes the
old inline queries produced (`user ?? null`, `token ?? null`); route response
schemas are unchanged, so serialization behavior is preserved.
