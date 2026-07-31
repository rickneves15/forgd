# SPEC-01: Email/password signup

**Status:** Ready
**Screen(s):** Sign up
**Related docs:** `prd.md` §4.1, `domain-model.md` §User

---

## 1. Context

Creates a new Student account with email + password. First step of the signup → onboarding → browse flow (PRD §4.1).

## 2. Out of Scope

- Google OAuth (SPEC-03)
- Login (SPEC-02)
- Choosing interests (SPEC-05) — happens right after, as a separate screen/call

## 3. Scenarios

### 3.1 Happy Path

```gherkin
Given an email not yet registered
When POST /v1/auth/register with username, email, password, college (optional)
Then a User is created, password is hashed (bcrypt), and an access+refresh token pair is returned — user is immediately logged in, no email verification gate
```

### 3.2 Error Cases

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Email already registered | email exists | register | 409 `EMAIL_TAKEN` |
| Username already taken | username exists | register | 409 `USERNAME_TAKEN` |
| Weak password | password < 8 chars | register | 400 `VALIDATION_ERROR` |

### 3.3 Edge Cases

- `college` is free text, optional, no format validation beyond a max length.
- Email is lowercased + trimmed before the uniqueness check.

## 4. Contract

### 4.1 Endpoint

```
POST /v1/auth/register
```

### 4.2 Auth

- Requires auth: no (public)
- Extra check: none

### 4.3 Request

```typescript
{
  username: string,      // 3-30 chars, unique
  email: string,         // valid email, unique
  password: string,      // min 8 chars
  college?: string        // free text, max 120 chars
}
```

### 4.4 Response (Success)

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": { "id": "...", "username": "...", "email": "...", "college": "..." }
}
```

### 4.5 Response (Errors)

| HTTP | Code | When |
|------|------|------|
| 400 | VALIDATION_ERROR | zod validation failure (weak password, bad email format, etc.) |
| 409 | EMAIL_TAKEN | email already registered |
| 409 | USERNAME_TAKEN | username already registered |

## 5. Acceptance Criteria

- [ ] Valid payload → 201, tokens + user returned
- [ ] Duplicate email → 409 `EMAIL_TAKEN`
- [ ] Duplicate username → 409 `USERNAME_TAKEN`
- [ ] Password stored only as bcrypt hash, never plaintext, never returned
- [ ] Covers all scenarios in §3

## 6. Implementation Notes

- No email verification step in V1 (ship-fast — see CONTEXT.md). Revisit if spam becomes a real problem.
- `refreshToken` returned in the response body (not a cookie) — this is a mobile app (Expo), store it in secure device storage (`expo-secure-store`), not `AsyncStorage`.
