# SPEC-03: Google OAuth login/signup

**Status:** Ready
**Screen(s):** Sign in, Sign up (same "Google" button on both)
**Related docs:** `prd.md` §4.1, `domain-model.md` §User

---

## 1. Context

Lets a Student sign in (or implicitly sign up on first use) with their Google account, from the Expo app. Exchanges Google's token for our own JWT pair — the app only ever handles Forgd's token shape after this (ADR-002).

## 2. Out of Scope

- Apple/Facebook (V2 — icons exist in `assets/icons/` but unused for now)
- Linking Google to an already-existing email/password account (not modeled in V1 — treat email match as the same account, see Edge Cases)

## 3. Scenarios

### 3.1 Happy Path

```gherkin
Given a valid Google ID token from the Expo app (via expo-auth-session / Google Sign-In)
When POST /v1/auth/google with that ID token
Then the backend verifies it with Google, finds-or-creates a User by the Google email, and returns our own accessToken+refreshToken
```

### 3.2 Error Cases

| Scenario | Given | When | Then |
|----------|-------|------|------|
| Invalid/expired Google token | tampered or expired idToken | POST /v1/auth/google | 401 `INVALID_GOOGLE_TOKEN` |

### 3.3 Edge Cases

- Email already registered via email/password → **same account is reused** (matched by email), no separate "linked accounts" concept in V1. `passwordHash` stays whatever it was; user can now log in either way.
- First-time Google user → account created on the fly, `college` left null (fill in later via profile edit), skip straight to onboarding (choose interests) same as a fresh signup.

## 4. Contract

### 4.1 Endpoint

```
POST /v1/auth/google
```

### 4.2 Auth

- Requires auth: no (public)
- Extra check: Google ID token must verify against Google's public keys server-side

### 4.3 Request

```typescript
{ idToken: string }  // from Google Sign-In on the Expo client
```

### 4.4 Response (Success)

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": { "id": "...", "username": "...", "email": "..." },
  "isNewUser": true
}
```

### 4.5 Response (Errors)

| HTTP | Code | When |
|------|------|------|
| 401 | INVALID_GOOGLE_TOKEN | token fails Google verification |

## 5. Acceptance Criteria

- [ ] Valid Google token, new email → creates User, `isNewUser: true`
- [ ] Valid Google token, existing email (whether from a prior Google login or an email/password signup) → logs into that same account, `isNewUser: false`
- [ ] Invalid token → 401
- [ ] `isNewUser` flag used by the app to decide whether to route to onboarding (SPEC-05) or straight to the Projects feed
- [ ] Covers all scenarios in §3

## 6. Implementation Notes

- Use `google-auth-library` server-side to verify the ID token (don't hand-roll JWT verification against Google's JWKS).
- Auto-generate a unique `username` from the Google profile name if needed (append a number on collision) — there's no "pick a username" step in the Google flow.
