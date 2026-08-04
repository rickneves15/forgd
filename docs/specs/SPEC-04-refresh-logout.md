# SPEC-04: Refresh token + logout

**Status:** Ready
**Screen(s):** *(no dedicated screen — background app behavior + Settings "Sign out" button)*
**Related docs:** `prd.md` §4.1

---

## 1. Context

Keeps the mobile session alive without forcing re-login every 15 minutes, and lets the user explicitly sign out.

## 2. Out of Scope

- Initial issuance of tokens (SPEC-01/02/03)
- Multi-device session management UI (not modeled — a logout just revokes the one refresh token the app is holding)

## 3. Scenarios

### 3.1 Happy Path

```gherkin
Given a valid, non-expired, non-revoked refreshToken
When POST /auth/refresh with that token
Then a new accessToken (and a rotated new refreshToken) is returned, and the old refreshToken is invalidated
```

### 3.2 Error Cases

| Scenario                    | Given                       | When                 | Then                                                                    |
| --------------------------- | --------------------------- | -------------------- | ----------------------------------------------------------------------- |
| Expired/revoked refresh token | expired or already-used token | POST /auth/refresh | 401 `INVALID_REFRESH_TOKEN` — app forces the user back to Sign in        |

### 3.3 Edge Cases

- Refresh token rotation: every successful refresh invalidates the old token and issues a new one, so a leaked-then-stolen old token can't be replayed after the legitimate client has refreshed.

## 4. Contract

### 4.1 Endpoint

```
POST /auth/refresh
POST /auth/logout
```

### 4.2 Auth

- `/refresh` — Requires auth: no (the refresh JWT itself is the credential, sent in the Authorization header)
- `/logout` — Requires auth: yes (access token) — Extra check: none

### 4.3 Request

```typescript
// POST /auth/refresh
// Authorization: Bearer <refreshToken>   (no request body)

// POST /auth/logout
// Authorization: Bearer <accessToken>    (no request body)
```

### 4.4 Response (Success)

```json
// /refresh
{ "accessToken": "eyJ...", "refreshToken": "eyJ..." }

// /logout
{ "success": true }
```

### 4.5 Response (Errors)

| HTTP | Code                  | When                                        |
| ---- | --------------------- | ------------------------------------------- |
| 401  | INVALID_REFRESH_TOKEN | expired, revoked, or unknown token          |

## 5. Acceptance Criteria

- [ ] Valid refresh → new token pair, old refresh token no longer usable
- [ ] Expired/revoked refresh → 401, app redirects to Sign in
- [ ] Logout deletes/invalidates the given refresh token row
- [ ] Covers all scenarios in §3

## 6. Implementation Notes

- The refresh token is a signed JWT (RS256, separate key pair from the access token), payload `{ sub: userId }`, 30-day expiry. Verification = JWT signature + presence of its row in `refresh_tokens` (the revocation record). Refresh-token rotation revokes the presented token's rows and issues a new pair; logout revokes the user's refresh token rows.
- App-side: on any `401` from any endpoint, attempt one silent `/refresh` before giving up and routing to Sign in.
