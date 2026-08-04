# SPEC-02: Email/password login + JWT issuance

**Status:** Ready
**Screen(s):** Sign in
**Related docs:** `prd.md` §4.1, `domain-model.md` §User

---

## 1. Context

Authenticates an existing Student with email + password, issues access+refresh tokens.

## 2. Out of Scope

- Registration (SPEC-01), Google OAuth (SPEC-03)
- Refresh/logout (SPEC-04)

## 3. Scenarios

### 3.1 Happy Path

```gherkin
Given a user with correct email+password
When POST /auth/login
Then they receive an accessToken (short-lived) and refreshToken (long-lived), both in the response body
```

### 3.2 Error Cases

| Scenario                            | Given                | When  | Then                                                                                                                                                                |
| ----------------------------------- | -------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wrong password or unknown email     | invalid credentials | login | 401 `INVALID_CREDENTIALS` (identical message either way — don't reveal which one was wrong)                                                                          |

### 3.3 Edge Cases

- Account created via Google-only (no password set) tries email/password login → 401 `INVALID_CREDENTIALS` (same generic message, don't leak "this account uses Google").

## 4. Contract

### 4.1 Endpoint

```
POST /auth/login
```

### 4.2 Auth

- Requires auth: no (public)
- Extra check: none

### 4.3 Request

```typescript
{ email: string, password: string }
```

### 4.4 Response (Success)

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": { "id": "...", "username": "...", "email": "..." }
}
```

### 4.5 Response (Errors)

| HTTP | Code                 | When                                                             |
| ---- | -------------------- | ---------------------------------------------------------------- |
| 400  | VALIDATION_ERROR     | missing/malformed fields                                          |
| 401  | INVALID_CREDENTIALS  | wrong password, unknown email, or Google-only account            |

## 5. Acceptance Criteria

- [ ] Valid login → 200, tokens + user
- [ ] Wrong password / unknown email / Google-only account → identical 401 response
- [ ] Covers all scenarios in §3

## 6. Implementation Notes

- No lockout/rate-limiting infra in V1 (would need Redis — skip for now per ship-fast; revisit only if brute-force abuse is actually observed).
- Access token payload: `{ sub: userId }`, 15min expiry (RS256). Refresh token: a signed JWT (RS256, 30-day expiry, separate key pair), payload `{ sub: userId }`. The refresh JWT is registered in the `refresh_tokens` table (with `userId` + `expiresAt`) so it can be revoked — the row is the revocation record, not a credential lookup.
