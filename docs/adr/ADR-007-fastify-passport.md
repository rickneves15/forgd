# ADR-007: Google OAuth with `@fastify/passport`, stateless

**Status:** Accepted
**Date:** 2026-08-03
**Supersedes:** the earlier ADR-007 drafted around `@fastify/oauth2` (deleted)

## Context

SPEC-03 originally shipped with `@fastify/oauth2`: the plugin owned the whole Authorization Code dance, generated the OAuth `state` itself (held in a cookie for CSRF), and the API fetched the profile from Google's `userinfo` endpoint. It also had a web platform leg with its own redirect URI and an optional cookie-based refresh-token flow.

Three things made that design untenable:

1. **No session should exist.** The API is deliberately sessionless (JWT + DB-rotated refresh tokens, ADR-002). `@fastify/oauth2`'s cookie-based `state` was the only thing that introduced a cookie into the API — and every cookie opens the door to CSRF. Any design that avoids cookies is strictly better here.
2. **Web is out of scope.** V1 ships mobile-only (CONTEXT.md). The web leg of the old flow ("redirect back with tokens in the URL / refresh-token cookie") was speculative and baked platform selection into the `state`.
3. **Hand-rolled `userinfo` HTTP.** The plugin's `userinfo()` needs metadata discovery; we were fetching it with a custom `fetch` wrapper and manual normalization. `passport-google-oauth20` returns a typed profile already and does its own token exchange.

## Decision

Reimplement Google OAuth with `@fastify/passport` + `passport-google-oauth20`, keeping the API **stateless between requests**:

- **One Authenticator, Google only.** `new Authenticator({ userProperty: 'passportUser' })` — the non-default property avoids clashing with `request.user`, which `@fastify/jwt` already decorates.
- **OAuth `state` lives in the database.** A custom passport-oauth2 `StateStore` persists the state as a row in `oauth_states` (10-minute TTL) and *consumes* it on verify — the row id *is* the opaque state. This gives CSRF protection without cookies, and single-use semantics for free.
- **No `Authenticator#initialize()`.** The stock initializer also registers `@fastify/flash`, which requires a `request.session` decorator — i.e. a cookie session, exactly what the design excludes. Instead, a small `fastify-plugin` decorates `request.passport` with a getter. With `session: false` plus a custom callback, passport's login/logout/flash machinery is never reached.
- **Mobile-only.** No `platform` param, no web redirect URI, no cookie. The callback redirects to `GOOGLE_MOBILE_REDIRECT_URI?code=<one-time>`.
- **Verification is plain passport.** The strategy exchanges the code server-side and returns a normalized profile; `email_verified` (the signed `_json` claim) gates account creation. No `id_token` JWT verification — the profile came over TLS with a fresh access token.

### Why JWT *and* this "session"

Three pieces of state coexist, and each exists for a different reason:

| Piece | Where | Why |
|-------|-------|-----|
| JWT pair (access + DB-stored refresh) | `tokens` table | The long-lived session model (ADR-002). Access token is a stateless JWT; the refresh token row is the revocation record (SPEC-04). |
| OAuth dance state | `oauth_states` table | CSRF protection for the browser hop. Lives only for the minutes the dance is in flight; consumed on first use. |
| One-time code | in-memory map (60s TTL) | Carries the token pair from the callback redirect to the app without ever putting tokens in a URL. Single-use, expires. |

None of these is a server-side "session" in the cookie/session-store sense — there is no `request.session`, no `@fastify/session`, and the API can be restarted between the start route and the callback (only the one-time code is in-memory, and it is short-lived by design).

## Rationale

- `@fastify/passport` is the maintained, type-safe way to run OAuth strategies in Fastify, and `passport-google-oauth20` already implements the Authorization Code + userinfo + profile normalization correctly — no custom OAuth plumbing.
- DB-backed state beats cookie-backed state: no CSRF surface, stateless API, and consuming the state row gives single-use (replay) protection that a cookie alone can't give.
- Hand-rolling `request.passport` keeps the dependency tree out of cookie-session territory without forking passport internals.
- Rejected alternative: **keep `@fastify/oauth2`** with DB-backed state. The plugin is built around its own cookie state and web-preset configuration; fighting it costs more than using the strategy directly. Rejected also: **`@fastify/session` + cookie state** — reintroduces exactly the session the API avoids.

## Consequences

- New `oauth_states` table + migration. The OAuth dance's state is single-use and expires after 10 minutes.
- `Authenticator#initialize()` is never called; the plugin provides `request.passport` itself. Any future strategy must be registered on the same `googlePassport` instance.
- `request.user` stays owned by `@fastify/jwt`; the passport user rides in the custom callback, never read off the request.
- The callback collapses every failure to one `401 INVALID_GOOGLE_TOKEN` — clients retry the dance; no internal detail leaks through the redirect.
- Integration tests swap the network for a fake strategy that still exercises the real state repository and the production `googleVerify`.
- Web flow (if it ever comes back) becomes a second strategy/callback on the same Authenticator — the DB state, resolution and error contract don't change.
