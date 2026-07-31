# ADR-004: Debug Request/Response Logging

**Status:** Accepted
**Date:** 2026-07-31

## Context

Fastify's built-in pino logging emits one line per request at `info` with only
`method`, `url`, `statusCode`, and `responseTime`. When debugging an issue there
is no way to see the actual headers, query string, or bodies of the requests and
responses the API received/sent. We wanted *complete* request and response
details without changing the default operational log.

## Decision

- **Hooks at `debug` level, not extended serializers.** Fastify's `info` log
  line stays unchanged. Two `debug`-level log lines are added via hooks:
  - `preHandler` — incoming request: `method`, `url` (with query), headers, body
    (the body is parsed only after `onRequest`, so `preHandler` is the first
    hook where it is available).
  - `onSend` — outgoing response: `statusCode`, response headers, response body
    (reusing the existing `onSend` hook that sets `x-request-id`).
  Extended pino `req`/`res` serializers were rejected: Fastify logs requests at
  `info`, so full details would always be visible instead of gated to `debug`.
- **Sensitive data is redacted, not omitted.** Bodies contain credentials —
  `password` in `/register` and `/login`, `refreshToken` in `/refresh`, and the
  login/refresh *responses* return `accessToken`/`refreshToken`. A `redact`
  helper deep-copies the object and masks any key matching a sensitive pattern
  (`password`, `token`, `authorization`, `secret`, `cookie`) as `[redacted]`.
  This applies to bodies and headers. The previous "never log bodies" rule is
  replaced by "log bodies, redacted, at debug" — redaction keeps the debugging
  value while protecting credentials.
- **Gated by `LOG_LEVEL`** (default `info`), so nothing changes by default;
  `LOG_LEVEL=debug` enables the complete details.
- **Tests unaffected** — `buildApp({ logger: false })` still disables the logger.

## Rationale

- Hooks keep the complete details optional and non-intrusive: `info` remains the
  concise operational log, and debugging verbosity is an opt-in env change.
- Redaction (rather than omitting bodies) is what makes the feature useful for
  debugging — you still see the request shape and which fields were sent.
- A small helper is more flexible than pino's path-based `redact` config and is
  unit-testable in isolation.

## Consequences

- To see full request/response details, run the API with `LOG_LEVEL=debug`.
- Credentials (`password`, `accessToken`, `refreshToken`, etc.) will never
  appear in plain text in the logs; verifying this is part of the tests for the
  `redact` helper.
- Sensitive *query string* values are not redacted (only body fields and
  headers); current routes put no secrets in the query string, so this is
  accepted for now.
- Requests rejected before `preHandler` (malformed JSON, validation errors)
  produce no `incoming request` debug line — only the `response sent` line and
  the error-handler's warn/error log. Accepted for now; the default Fastify
  `info` line still covers those requests.
