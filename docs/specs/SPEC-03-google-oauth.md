# SPEC-03: Google OAuth login/signup

**Status:** Ready
**Screen(s):** Sign in, Sign up (same "Google" button on both)
**Related docs:** `prd.md` §4.1, `domain-model.md` §User / §OAuth Identity, `adr/ADR-006-oauth-identities.md`, `adr/ADR-007-fastify-passport.md`, `auth-flows.md`

---

## 1. Context

Lets a Student sign in (or implicitly sign up on first use) with their Google account, from the Expo app. There is no web client: the whole dance is **mobile-only**, driven by the mobile deep link `forgd://auth-callback`.

The API owns the entire OAuth dance with `@fastify/passport` + `passport-google-oauth20` (ADR-007): the client only opens a browser session to Google and hands the result back to the API. There is no ID-token round-trip and no hand-rolled OAuth plumbing — the strategy performs the Authorization Code exchange with the web client's secret, and the API reads the user's profile from Google's `userinfo` endpoint. The app only ever handles Forgd's own token shape after this (ADR-002).

OAuth identities are modeled per-provider in `oauth_accounts` (ADR-006): one Forgd User can have multiple OAuth identities (Google today; Apple/Facebook in a future version), the same way apps like Discord let you connect several external accounts.

The "session" of the OAuth dance lives in the **database**, not in cookies: the strategy's `state` is persisted in `oauth_states` via a StateStore, and the resulting token pair is handed to the app through a short-lived, single-use one-time code (ADR-007). The API itself stays sessionless between requests.

## 2. Out of Scope

- Apple/Facebook (future version — the `oauth_accounts` table is the groundwork; icons exist in `assets/icons/` but unused for now).
- An explicit "connect/disconnect OAuth" endpoint or Settings UI (linking happens via auto-link at login only — there is no endpoint to attach an identity to an already-logged-in user yet).
- A web client (SPA/frontend) and any browser-based OAuth flow. There is no `platform` switch, no web redirect URI, and no cookie-based session.

## 3. Scenarios

### 3.1 Happy Path

```gherkin
Given the client opens the Forgd OAuth entry point
When it completes Google's authorization page in a browser session
Then the API exchanges the code for tokens, reads the Google profile,
    resolves it to a User
    (by (provider, sub) → by email auto-link → by creating one),
    and the client ends up with our own accessToken+refreshToken
```

Resolution order (see ADR-006):

1. **By identity:** `oauth_accounts` row exists for `('google', sub)` → log in that User.
2. **By email auto-link:** no identity row, but a User exists with the same email → insert the `oauth_accounts` row for that User and log in. Google emails are globally unique, so this can never merge two distinct Google users.
3. **By creation:** no identity row and no email match → create the User (no password) plus the identity row, then log in.

### 3.2 Error Cases

All callback failures collapse to a single 401 — clients just retry the whole dance. No internal detail leaks through the redirect.

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Google error/cancel | Google redirects back with an `error` param | GET /auth/oauth/google/callback | 401 `INVALID_GOOGLE_TOKEN` |
| Invalid/missing state or code | callback hit without a valid `code`/`state` | GET /auth/oauth/google/callback | 401 `INVALID_GOOGLE_TOKEN` |
| Replayed/expired state | a `state` already consumed (single-use) | GET /auth/oauth/google/callback | 401 `INVALID_GOOGLE_TOKEN` |
| Failed code exchange / userinfo | code is invalid/expired, or Google's userinfo call fails | GET /auth/oauth/google/callback | 401 `INVALID_GOOGLE_TOKEN` |
| Unverified Google email | userinfo returns `email_verified: false` | GET /auth/oauth/google/callback | 401 `INVALID_GOOGLE_TOKEN` |
| Bad/used/expired one-time code | invalid body or a consumed code | POST /auth/oauth/exchange | 400 `INVALID_OR_EXPIRED_CODE` |

### 3.3 Edge Cases

- **Google login for an email that already has a password** → **same account is reused** and the Google identity is recorded in `oauth_accounts`. `passwordHash` stays whatever it was; the user can now log in either way.
- **`sub` wins over email:** once an identity row exists, the email on future profiles is ignored for resolution — a Google user who later changes their Gmail address still logs into the same account.
- **Second Google identity with the same email:** unreachable in practice (two Google accounts cannot share an email). If it happens, the user is logged in via the email path but the identity is **not** recorded (the `UNIQUE(userId, provider)` rule).
- **First-time Google user** → account created on the fly, `college` left null (fill in later via profile edit), `avatarUrl` seeded from the Google profile picture, skip straight to onboarding (choose interests) same as a fresh signup.
- **Duplicate simultaneous signups** (double-tap / retry) → the losing request hits a unique constraint; treated as "already exists": re-read and log in with `isNewUser: false`.
- **Attacker-controlled callback state:** a non-UUID state can't become a DB query error — it's rejected before touching the database (see `consumeOAuthState`).

## 4. Contract

### 4.1 Endpoints

```
GET  /auth/oauth/google    # starts the flow (302 → Google)
GET  /auth/oauth/google/callback   # Google's redirect target
POST /auth/oauth/exchange  # mobile: one-time code → tokens
```

The callback path is the `redirect_uri` registered in the Google Cloud Console: `<API_PUBLIC_URL>/auth/oauth/google/callback`.

### 4.2 Auth

- Requires auth: no (public)
- The API runs the whole dance with `@fastify/passport` (`passport-google-oauth20`, Authorization Code flow, confidential client + `GOOGLE_CLIENT_SECRET`, no PKCE — a server-side exchange over TLS). `state` is an opaque row id persisted in `oauth_states` (10-minute TTL) through the strategy's StateStore; verifying a state consumes it, so replay is impossible (ADR-007).
- Identity comes from Google's `userinfo` endpoint, fetched by the strategy itself with the freshly-exchanged `access_token`, gated on `email_verified: true` (the signed id_token claim in `_json`).
- No `id_token` verification: the profile is fetched server-side with the freshly-exchanged `access_token` over TLS, so a client-supplied JWT signature check adds nothing (ADR-007).

### 4.3 Flow (mobile)

1. The Expo app opens `openAuthSessionAsync('<API_PUBLIC_URL>/auth/oauth/google', 'forgd://auth-callback')` (`expo-web-browser`).
2. The API persists a `state` row and responds `302` to Google's authorization page (the account chooser — Google's own page, the API renders nothing).
3. Google redirects to `GET /auth/oauth/google/callback?code=...&state=...`.
4. The API consumes and validates `state` (single-use), exchanges `code` for tokens, fetches `userinfo`, checks `email_verified`, resolves the identity (§3.1), issues the JWT pair, and creates a short-lived one-time code.
5. The API responds `302` to `<GOOGLE_MOBILE_REDIRECT_URI>?code=<one-time>`.
6. The app reads the one-time code from the deep link and calls `POST /auth/oauth/exchange`, which consumes the code and returns the token pair. Deep-link URLs can leak (history/logs), so real tokens never travel in a URL — only a single-use, 60-second code.

### 4.4 Response (Success)

`POST /auth/oauth/exchange` returns the same shape as `/register` and `/login`:

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": { "id": "...", "username": "...", "email": "...", "college": null },
  "isNewUser": true
}
```

`user` matches the shape returned by `/login` and `/register` (including `college`). `isNewUser` is `true` only when the account was created by this request (resolution path 3); the app uses it to route to onboarding (SPEC-05) or straight to the Projects feed.

### 4.5 Response (Errors)

| HTTP | Code | When |
|------|------|------|
| 400 | VALIDATION_ERROR | exchange body missing/invalid `code` |
| 400 | INVALID_OR_EXPIRED_CODE | one-time code unknown, already consumed, or past its 60-second TTL |
| 401 | INVALID_GOOGLE_TOKEN | any callback failure: Google `error`, missing/invalid/replayed state or code, code exchange/userinfo failure, or `email_verified` is false |

Callback errors are JSON (`{ code, message }`), consistent with the rest of the API. A future refinement may redirect errors to the app via the deep link instead.

## 5. Acceptance Criteria

- [ ] `GET /auth/oauth/google` → `302` to `accounts.google.com` with `client_id` = `GOOGLE_CLIENT_ID`, `redirect_uri` = `<API_PUBLIC_URL>/auth/oauth/google/callback`, `scope=openid email profile`, and `state`
- [ ] The `state` shown to Google is a row in `oauth_states`, and is consumed (deleted) by the callback
- [ ] Mobile happy path → `302` to `<GOOGLE_MOBILE_REDIRECT_URI>?code=<one-time>`; `POST /auth/oauth/exchange` with that code returns the full JSON shape (§4.4)
- [ ] One-time code is single-use and expires (replay → `400 INVALID_OR_EXPIRED_CODE`); tokens never appear in a redirect URL
- [ ] Replayed/expired/unknown OAuth `state` → `401 INVALID_GOOGLE_TOKEN`
- [ ] Valid Google profile, new email → creates User + `oauth_accounts` row, `isNewUser: true`, `passwordHash` null, `avatarUrl` = Google picture
- [ ] Existing identity row → logs into that account, `isNewUser: false`
- [ ] Existing email (from a prior Google login or an email/password signup) → same account, identity row created, `passwordHash` unchanged, `isNewUser: false`
- [ ] `email_verified: false` → `401 INVALID_GOOGLE_TOKEN`
- [ ] Failed exchange/userinfo → `401 INVALID_GOOGLE_TOKEN`
- [ ] Auto-generated unique username on creation (normalized; number suffix on collision)
- [ ] Concurrent duplicate signups resolve to a single account, not an error
- [ ] The JWT pair issued on the callback is the same pair the exchange returns (no second signing on the mobile round-trip)
- [ ] Covers all scenarios in §3

## 6. Implementation Notes

- **Dependencies:** `@fastify/passport` + `passport-google-oauth20` (+ `passport`). No `@fastify/session`, no `@fastify/cookie`, no `google-auth-library`, no `@fastify/oauth2` — the API is sessionless and no `id_token` is verified anywhere.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` env vars: the web OAuth client's credentials, used by the strategy for the token exchange.
- `API_PUBLIC_URL` env var: the API's public base URL, used to derive `redirect_uri`; must match what is registered in the Google Cloud Console.
- `GOOGLE_MOBILE_REDIRECT_URI` env var: the mobile deep link the callback redirects to with the one-time code (§4.3).
- The single `Authenticator` lives in `src/http/plugins/oauth/google.ts` and only knows Google (`userProperty: 'passportUser'` avoids the `request.user` decorator already owned by `@fastify/jwt`). `Authenticator#initialize()` is not used: it would register `@fastify/flash`, which needs a `request.session` decorator (a cookie session) — excluded by the design. The plugin instead decorates `request.passport` with a getter (ADR-007).
- The OAuth `state` store is `src/services/auth/google/state-store.ts` (a passport-oauth2 StateStore over `oauth_states`); the repository enforces the 10-minute TTL and single-use consume.
- The one-time code store lives in `src/lib/auth/google/one-time-code.ts` (in-memory `Map`, 60-second TTL, single-use consume, `clearOneTimeCodes()` test hook). The full success body (§4.4) is stored with the code so `POST /auth/oauth/exchange` can return it as-is.
- Profile normalization (`sub`, `email`, `name`, `picture`, `emailVerified` gated on `_json.email_verified`) lives in `src/lib/auth/google/profile.ts`; `resolveGoogleIdentity` in `src/services/auth/google/identity.ts`.
- Routes live in `src/http/routes/auth/oauth/` (`google.ts` for start/callback, `exchange.ts` for the code swap). Both Google routes delegate entirely to the `googleAuth` preValidation hook; the handlers throw 404 to surface a "hook did not reply" bug instead of a silent 200.
- Integration tests replace the network with a fake strategy (`test/helpers/auth/fake-google-strategy.ts`) that reuses the real `oauth_states` repository and the production `googleVerify` — no real Google calls, while the state dance and identity resolution are exercised end to end.
