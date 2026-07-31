# Debug Request/Response Logging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Log complete request and response details (headers, query, redacted bodies) at `debug` level, keeping Fastify's default `info` log unchanged.

**Architecture:** Add a `redact` helper that deep-copies objects and masks sensitive keys. Wire two `debug`-level Fastify hooks in `buildApp`: one to log the incoming request (method, url, headers, body) and one to log the outgoing response (status, headers, body) in the existing `onSend` hook. Request body must be logged from `preHandler`, not `onRequest`, because the body is parsed after `onRequest` runs.

**Tech Stack:** Fastify (pino logger), Zod, Vitest.

---

## Task 1: `redact` helper (TDD)

**Files:**
- Create: `api/src/utils/redact.ts`
- Test: `api/src/utils/redact.test.ts`

- [ ] **Step 1: Write the failing test**

Create `api/src/utils/redact.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { redact } from './redact'

describe('redact', () => {
  it('redacts sensitive values in nested objects', () => {
    const input = {
      name: 'Alice',
      email: 'alice@example.com',
      password: 'secret123',
      address: { city: 'X' },
    }

    expect(redact(input)).toEqual({
      name: 'Alice',
      email: 'alice@example.com',
      password: '[redacted]',
      address: { city: 'X' },
    })
  })

  it('redacts accessToken and refreshToken (case-insensitive)', () => {
    const input = { refreshToken: 'a.b.c', tokens: { accessToken: 'x.y.z' } }

    expect(redact(input)).toEqual({
      refreshToken: '[redacted]',
      tokens: { accessToken: '[redacted]' },
    })
  })

  it('redacts inside arrays', () => {
    expect(redact([{ password: 'p' }, { ok: 1 }])).toEqual([
      { password: '[redacted]' },
      { ok: 1 },
    ])
  })

  it('returns primitives unchanged', () => {
    expect(redact('hello')).toBe('hello')
    expect(redact(null)).toBeNull()
    expect(redact(42)).toBe(42)
  })

  it('does not mutate the input', () => {
    const input = { password: 'p' }
    redact(input)
    expect(input.password).toBe('p')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/utils/redact.test.ts`
Expected: FAIL — module `./redact` cannot be found.

- [ ] **Step 3: Write the minimal implementation**

Create `api/src/utils/redact.ts`:

```ts
const SENSITIVE_KEY_PATTERN = /password|token|authorization|secret|cookie/i

export const redact = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(redact)
  }

  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {}

    for (const [key, nested] of Object.entries(value)) {
      result[key] = SENSITIVE_KEY_PATTERN.test(key)
        ? '[redacted]'
        : redact(nested)
    }

    return result
  }

  return value
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run src/utils/redact.test.ts`
Expected: PASS — 5 tests.

- [ ] **Step 5: Commit**

```bash
git add api/src/utils/redact.ts api/src/utils/redact.test.ts
git commit -m "feat(api): add redact helper for sensitive log fields"
```

---

## Task 2: Wire debug logging hooks in `buildApp`

**Files:**
- Modify: `api/src/http/app.ts:44` (imports) and `api/src/http/app.ts:52-56` (hooks)
- Modify: `docs/adr/ADR-004-debug-request-response-logging.md` (hook name correction)

- [ ] **Step 1: Add the `redact` import and response body helper**

In `api/src/http/app.ts`, add the import after the `errorHandler` import (line 14):

```ts
import { redact } from '../utils/redact'
```

Add a module-level helper before `type BuildAppOptions` (after the imports):

```ts
// The onSend payload is a serialized JSON string; parse it back so the log
// shows a structured body instead of an escaped string. Non-JSON payloads
// (e.g. 204 responses) are logged as-is.
const redactBody = (payload: unknown) => {
  if (typeof payload === 'string') {
    try {
      return redact(JSON.parse(payload))
    } catch {
      return payload
    }
  }

  return redact(payload)
}
```

- [ ] **Step 2: Add the request `debug` log in `preHandler`**

Replace the existing `onSend` hook block in `api/src/http/app.ts` (lines 52-56) with:

```ts
  // Complete request/response details at debug level (LOG_LEVEL=debug). The
  // default info log stays concise; this is opt-in verbosity for debugging.
  // Bodies are logged but redacted (see ADR-004). preHandler is used instead
  // of onRequest because the body is only parsed after onRequest runs.
  app.addHook('preHandler', (request, _reply, done) => {
    request.log.debug(
      {
        requestId: request.id,
        method: request.method,
        url: request.url,
        headers: redact(request.headers),
        body: redact(request.body),
      },
      'incoming request',
    )
    done()
  })

  // Echo the request id back to clients so errors can be traced in the logs.
  app.addHook('onSend', (request, reply, payload, done) => {
    reply.header('x-request-id', request.id)

    request.log.debug(
      {
        requestId: request.id,
        statusCode: reply.statusCode,
        headers: redact(reply.getHeaders()),
        body: redactBody(payload),
      },
      'response sent',
    )
    done()
  })
```

- [ ] **Step 3: Update ADR-004 to reflect `preHandler`**

In `docs/adr/ADR-004-debug-request-response-logging.md`, change the first bullet of the Decision section so `onRequest` becomes `preHandler`:

```markdown
  - `preHandler` — incoming request: `method`, `url` (with query), headers, body
    (the body is parsed only after `onRequest`, so `preHandler` is the first
    hook where it is available).
```

- [ ] **Step 4: Run the full checks**

Run from `api/`:

```bash
pnpm exec tsc --noEmit
pnpm exec biome check src test
pnpm test
```

Expected: tsc clean, biome clean, 21 tests pass (logging hooks are inactive with `logger: false`).

- [ ] **Step 5: Verify manually at `LOG_LEVEL=debug`**

Start the server with debug logging:

```bash
LOG_LEVEL=debug pnpm dev
```

In another terminal, exercise an auth flow and confirm the debug lines show full details with secrets redacted:

```bash
curl -s -X POST http://localhost:3333/register \
  -H 'content-type: application/json' \
  -d '{"name":"Debug Test","email":"debug@test.com","password":"super-secret"}'
```

Expected in the server log:
- `incoming request` line with `method`, `url`, `headers`, and `body` containing `password: "[redacted]"`.
- `response sent` line with `statusCode: 201`, response `headers`, and `body` containing `accessToken: "[redacted]"` and `refreshToken: "[redacted]"`.
- No plaintext `super-secret` anywhere in the log.

Stop the server afterwards.

- [ ] **Step 6: Commit**

```bash
git add api/src/http/app.ts docs/adr/ADR-004-debug-request-response-logging.md
git commit -m "feat(api): log full requests and responses at debug level"
```
