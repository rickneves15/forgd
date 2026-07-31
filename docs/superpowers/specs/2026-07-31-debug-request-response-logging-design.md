# Debug Request/Response Logging — Design

## Problem

The API currently logs one line per request at `info` level via Fastify's built-in
pino logging, but it only includes `method`, `url`, `statusCode`, and `responseTime`.
When debugging an issue, there is no way to see the actual headers, query string, or
bodies of the requests and responses the API received/sent.

The goal is to log **complete** request and response details (headers, query, body,
status, response headers/body) — while keeping the default operational log unchanged.

## Decisions

- **Approach B (hooks at `debug` level).** Keep Fastify's built-in `info` log line.
  Add two `debug`-level log lines:
  - `onRequest` — incoming request: `method`, `url` (with query), headers, body.
  - `onSend` — outgoing response: `statusCode`, response headers, response body
    (the existing `onSend` hook that sets `x-request-id` is the natural home for this).
- **Redaction.** Request/response bodies can contain credentials:
  - `POST /register` and `POST /login` send `password` in the body.
  - `POST /refresh` sends `refreshToken`.
  - Login/refresh **responses** return `accessToken` and `refreshToken`.
  A `redact` helper walks an object and masks the value of any key matching a
  sensitive pattern: `password`, `token`, `authorization`, `secret`, `cookie`.
  Values become `[redacted]`. This applies to bodies and headers.
- **Level.** Complete details are emitted at `debug`, gated by `LOG_LEVEL`
  (default `info`, so nothing changes by default). Set `LOG_LEVEL=debug` to see them.
- **Tests.** `buildApp({ logger: false })` is unaffected; no test changes needed.

## Components

- `src/utils/redact.ts` — exported `redact(value: unknown): unknown` that deep-copies
  plain objects/arrays and masks sensitive keys (case-insensitive pattern match).
- `src/http/app.ts` — add a `debug` log in the existing `onRequest` scope and extend
  the existing `onSend` hook with a `debug` log of the response details.

## Files

| File | Change |
|---|---|
| `src/utils/redact.ts` | New — `redact` helper |
| `src/http/app.ts` | Debug request log + response details in `onSend` |

## Out of Scope

- Changing the `info`-level operational log format.
- Redacting at the pino `redact` config level (path-based, less flexible than a helper).
- Body logging in `production` (bodies appear only when `LOG_LEVEL=debug` is set).
