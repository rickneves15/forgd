# Auth Flows

Every auth mechanism in the Forgd API, drawn end to end. The API is **sessionless**: all state lives in the database or in short-lived codes, never in cookies (see ADR-002, ADR-007).

All endpoints live under the auth plugin scope: `/register`, `/login`, `/auth/oauth/*`, `/refresh`, `/logout`.

## Token model

- **Access token:** short-lived JWT (15 min, RS256) signed with `reply.jwtSign`, payload `{ sub, jti }`.
- **Refresh token:** JWT (30 days, separate RS256 key pair) signed with `reply.refreshJwtSign`, payload `{ sub, jti }`.
- Both are recorded as SHA-256 hashes in `tokens` (with `type` and `expiresAt`). The row is the revocation record: delete it and the JWT stops being accepted. `jti` makes every token unique so rotation can tell old and new tokens apart (SPEC-04).

## Register

```mermaid
sequenceDiagram
    participant App as Expo app
    participant API as Forgd API
    participant DB as Postgres

    App->>API: POST /register { username, email, password, college? }
    API->>API: validate body (zod)
    API->>DB: find user by email or username
    alt email/username taken
        API-->>App: 409 EMAIL_TAKEN / USERNAME_TAKEN
    else password < 8 chars, bad email, ...
        API-->>App: 400 VALIDATION_ERROR
    else ok
        API->>DB: INSERT user (bcrypt(password))
        API->>DB: INSERT access + refresh token rows (hashes)
        API-->>App: 201 { accessToken, refreshToken, user }
    end
```

## Login

```mermaid
sequenceDiagram
    participant App as Expo app
    participant API as Forgd API
    participant DB as Postgres

    App->>API: POST /login { email, password }
    API->>DB: find user by email
    alt no user / no passwordHash (Google-only) / wrong password
        API-->>App: 401 INVALID_CREDENTIALS (identical, no account oracle)
    else ok
        API->>DB: INSERT access + refresh token rows (hashes)
        API-->>App: 200 { accessToken, refreshToken, user }
    end
```

## Google OAuth (mobile)

The API owns the whole dance with `@fastify/passport` + `passport-google-oauth20` (ADR-007). The OAuth `state` is a row in `oauth_states` (10-min TTL, single-use); the token pair is never in a URL — it is handed over via a 60-second one-time code.

```mermaid
sequenceDiagram
    participant App as Expo app
    participant WB as expo-web-browser
    participant G as Google
    participant API as Forgd API
    participant DB as Postgres

    App->>WB: openAuthSessionAsync(<API_PUBLIC_URL>/auth/oauth/google, forgd://auth-callback)
    WB->>API: GET /auth/oauth/google
    API->>DB: INSERT oauth_states row (10-min TTL)
    API-->>WB: 302 accounts.google.com?state=<row-id>&scope=openid email profile
    WB->>G: Google account chooser
    G-->>WB: callback URL?code=...&state=<row-id>
    WB->>API: GET /auth/oauth/google/callback?code=...&state=...
    API->>DB: consume oauth_states row (single-use)
    alt state missing / unknown / replayed / expired
        API-->>WB: 401 INVALID_GOOGLE_TOKEN
    else state ok
        API->>G: exchange code → tokens → fetch userinfo (server-side)
        alt email_verified is false
            API-->>WB: 401 INVALID_GOOGLE_TOKEN
        else profile verified
            API->>DB: resolve identity (sub → email auto-link → create, ADR-006)
            API->>DB: INSERT access + refresh token rows (hashes)
            API->>API: store { tokens, user, isNewUser } behind one-time code (60s)
            API-->>WB: 302 forgd://auth-callback?code=<one-time>
        end
    end
    WB-->>App: deep link with one-time code
    App->>API: POST /auth/oauth/exchange { code }
    API->>API: consume one-time code
    alt code invalid / used / expired
        API-->>App: 400 INVALID_OR_EXPIRED_CODE
    else ok
        API-->>App: 200 { accessToken, refreshToken, user, isNewUser }
    end
```

## Refresh (rotation)

```mermaid
sequenceDiagram
    participant App as Expo app
    participant API as Forgd API
    participant DB as Postgres

    App->>API: POST /refresh (Authorization: Bearer <refreshToken>)
    API->>API: verify refresh JWT signature
    API->>DB: find tokens row by hash(refreshToken) AND type='refresh'
    alt row missing or expired
        API-->>App: 401 INVALID_REFRESH_TOKEN → App forces Sign in
    else ok
        API->>DB: DELETE all refresh rows for user (old token is dead)
        API->>DB: DELETE all access rows for user (no more live access JWTs)
        API->>DB: INSERT fresh access + refresh rows
        API-->>App: 200 { accessToken, refreshToken }
    end
```

## Logout

```mermaid
sequenceDiagram
    participant App as Expo app
    participant API as Forgd API
    participant DB as Postgres

    App->>API: POST /logout (Authorization: Bearer <accessToken>)
    API->>API: verify access JWT signature
    API->>DB: DELETE all access + refresh rows for user
    API-->>App: 200 { success: true }
```

## Error reference

| HTTP | Code                         | Endpoint                        | When                                                                          |
| ---- | ---------------------------- | ------------------------------- | ----------------------------------------------------------------------------- |
| 400  | VALIDATION_ERROR             | any                             | zod schema rejected the body                                                  |
| 400  | INVALID_OR_EXPIRED_CODE      | POST /auth/oauth/exchange       | one-time code unknown, used, or past 60s                                      |
| 401  | INVALID_CREDENTIALS          | POST /login                     | unknown email, Google-only account, or wrong password                         |
| 401  | INVALID_GOOGLE_TOKEN         | GET /auth/oauth/google/callback | any Google-side failure (cancel, state, exchange, userinfo, unverified email) |
| 401  | INVALID_REFRESH_TOKEN        | POST /refresh                   | refresh JWT missing/expired/revoked/unknown                                   |
| 409  | EMAIL_TAKEN / USERNAME_TAKEN | POST /register                  | email or username already in use                                              |
