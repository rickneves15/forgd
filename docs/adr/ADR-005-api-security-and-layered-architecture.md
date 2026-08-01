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
- **Layered structure:** routes (inline business logic) → repositories.
  - `src/http/routes/*` — zod schema plus the handler's business rules
    (email-vs-username conflicts, password hashing, token rotation), throwing
    `HttpError`s. Kept inline while the rules fit in a single handler.
  - `src/lib/auth/tokens.ts` — the one shared piece of auth logic
    (`issueTokenPair`): signs the access + refresh pair and persists the
    refresh token hash. Reused by register, login and refresh.
  - `src/db/repositories/*` — data access (drizzle queries), no business
    rules. Lives under `src/db/` because it is the only layer that touches
    the database.
  - Errors live in `src/http/errors/` so routes can import them without
    coupling SQL or helpers to the routes layer.
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
  Repositories extract the SQL while the rules stay in the handler for now — a
  full use-cases layer was tried and removed again (ADR-005, 2026-07-31) as
  ceremony that adds a file hop for every route without a concrete payoff at
  this scope. Nothing heavier (no DI container, no CQRS) is justified either.
- One error shape everywhere (`{ code, message }`) is what the client already
  parses for 4xx/5xx; Fastify's default 404 body is the only outlier.
- Railway probes the health endpoint every few seconds; a rate limit on it
  would cause false unhealthy signals.

## Consequences

- All SQL goes in `src/db/repositories/`, shared auth logic in
  `src/lib/auth/tokens.ts`. Routes hold business rules and do not import
  `@/db` directly — the one exception is `GET /health`, which pings Postgres
  directly as an ops probe (no business logic to wrap; a repository for
  `SELECT 1` would be ceremony).
- `src/functions/` and `src/use-cases/` are removed.
- `/health` is public and unauthenticated — it reveals only whether the
  service and DB are up, nothing else.
- The in-memory rate limit resets on restart and does not share across
  instances; acceptable at current single-instance scale.
